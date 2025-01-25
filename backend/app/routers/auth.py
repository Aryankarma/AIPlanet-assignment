from fastapi import APIRouter, Request, HTTPException, Depends, Form, BackgroundTasks
from datetime import timedelta, timezone, datetime
from app.models.user import User, Token, LoginRequest
from app.db.database import users_collection
from app.core.security import hash_password, verify_password
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from typing import List
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import smtplib
from email.message import EmailMessage

router = APIRouter()

# auth variables
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = "thisismysecret" 
ALGORITHM = "HS256"

# email mechanism variables
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = "servicepostparcel@gmail.com"
SMTP_PASSWORD = "aooo upev brdz walg"


@router.post("/register")
async def register(user: User, background_tasks: BackgroundTasks):
    # print recieved user details
    print(user)
    existing_user = await users_collection.find_one({"email": user.email})
    print("existinguser", existing_user)
    # if existing_user != None:
    #     raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(user.password)
    await users_collection.insert_one({"name": user.name, "email": user.email, "password": hashed_password, "verified": False})
    # user is created in db

    # generating & sending verification url through token
    verification_token = create_access_token({"email": user.email}, timedelta(hours=1))
    verification_url = f"http://localhost:5173/verify-email?token={verification_token}"
    background_tasks.add_task(send_verification_email, user.email, verification_url)

    return {"message": "User created successfully, please verify your email"}


@router.post("verify-email")
async def verifyEmail(token: str):
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[algorithm])
        email = payload.get("email")
        if email is None: 
            raise HTTPException(status_code = 400, detail = "Invalid token")

        # update the user as verified in the db
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code = 404, detail =  "User not found")

        if user.get("verified"):
            return {"message" : "Email is already verified"}
        
        await users_collection.update_one({"email": email}, {"$set": {"verified": true}})
        return {"message" : "Email verified successfully"}
    except jwt.ExceptSignatureError:
        raise HTTPException(status_code = 400, message = "Verification token expired.")
    except jwt.PyJWTError: 
        raise HTTPException(status_code = 400, message = "Invalid token")


@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    print("email: ", email, " password: ", [password] )
    user = LoginRequest(email=email, password=password)
    print(user)
    db_user = await users_collection.find_one({"email": user.email})
    print(db_user)

    if not db_user["verified"]:
        raise HTTPException(status_code=403, detail="Email not verified")
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    
    expires = datetime.now(timezone.utc) + access_token_expires

    response = JSONResponse(content={"message": "Login successful"})
    print(response, access_token)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, # true in prod
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=expires,
        samesite="Strict"
    )

    return response


@router.get("/users", response_model=List[dict])
async def list_users():
    """Retrieve all users from the database."""
    print("list user 1 is working")
    users = await users_collection.find().to_list(100)
    print("serializing this users", users)
    return [serialize_user(user) for user in users]
    return response


def send_verification_email(to_email: str, verification_url: str): 
    print(to_email)
    print(verification_url)
    """Send email verification link to the user"""

    subject = "Verify your email"
    content = f"Click the link to verify your email: {verification_url}"
    
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.set_content(content)

    try: 
        print("Connecting to the SMTP server...")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            print("Logging into the SMTP server...")
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            print("Sending the email...")
            server.send_message(msg)
            print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

 

def create_access_token(data: dict, expires_delta: timedelta):
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})  # Add expiration time
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    decoded = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=ALGORITHM)
    print("decoded token : ", decoded)

    return encoded_jwt


def serialize_user(user) -> dict:
    """Convert MongoDB user document to a Python dictionary."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }












# @router.post("/login", response_model=Token)
# async def login(request: OAuth2PasswordRequestForm = Depends()):
# # async def login(user: LoginRequest):
#     print(user)

#     db_user = await users_collection.find_one({"username": user.username})
#     print(db_user)
    
#     if not db_user or not verify_password(user.password, db_user["password"]):
#         raise HTTPException(status_code=400, detail="Invalid credentials")
    
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(data={"sub": request.username}, expires_delta=access_token_expires)

#     # setup httponly cookie
#     response = JSONResponse(content={"message": "Login Successful"})
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         secure=True, # if in production -> true
#         max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         expires=datetime.utcnow() + access_token_expires, 
#         samesite="Strict"
#     )

#     return response
