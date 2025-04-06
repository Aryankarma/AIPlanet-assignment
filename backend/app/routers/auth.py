from fastapi import APIRouter, Request, HTTPException, Depends, Form, BackgroundTasks
from datetime import timedelta, timezone, datetime
from app.models.user import User, Token, LoginRequest, Token
from app.db.database import users_collection, tokens_collection
from app.core.security import hash_password, verify_password
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from typing import List
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import smtplib
import secrets
from email.message import EmailMessage
from motor.motor_asyncio import AsyncIOMotorCollection

router = APIRouter()

# auth variables
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60
SECRET_KEY = "thisismysecret"
ALGORITHM = "HS256"

# email mechanism variables
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = "servicepostparcel@gmail.com"
SMTP_PASSWORD = "aooo upev brdz walg"


@router.post("/logout")
async def logout(request: Request):
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("access_token")
    
    # Optionally, invalidate the token in your database
    await tokens_collection.delete_one({
        "token": request.cookies.get('access_token'),
        "type": "session"
    })
    
    return response


# check auth status 
@router.get("/status")
async def authStatus(request: Request):
    # The middleware has already validated the token
    # So if we reach this point, the user is authenticated
    print("checking auth status")
    print("request details: ", request)
    user = await users_collection.find_one({"email": request.state.user.get("sub")})

    return {
        "authenticated": True,
        "user": {
            "email": user["email"],
            "name": user.get("name"),
            "verified": user.get("verified", False)
        }
    }
   
   
@router.post("/register")
async def register(user: User, background_tasks: BackgroundTasks):
    # print recieved user details
    print(user)
    existing_user = await users_collection.find_one({"email": user.email})
    print("existinguser", existing_user)
    if existing_user != None:
        raise HTTPException(status_code=400, detail='User with this email already exists')

    # generate a verification token
    verification_token = secrets.token_urlsafe(32)
    token_expiry = datetime.now(timezone.utc) + timedelta(hours=24)

    # store the token with expiry 
    await tokens_collection.insert_one({"email": user.email, "token": verification_token, "expires_at": token_expiry, "used": False, })

    # create user with hashed password and insert into db
    hashed_password = hash_password(user.password)
    await users_collection.insert_one({"name": user.name, "email": user.email, "password": hashed_password, "verified": False, "pineconeConnect": False, "created_at": datetime.now(timezone.utc)})

    # generating & sending verification url through token
    # verification_token = create_access_token({"email": user.email}, timedelta(hours=1)) # old this was
    verification_url = f"http://localhost:5173/verify-email?token={verification_token}" # using new verification token (from secrets)
    # emailStatus = background_tasks.add_task(send_verification_email, user.email, verification_url)
    emailStatus = send_verification_email(user.email, verification_url)

    if emailStatus["success"]:
        return {"message": f"A verification link has been sent to {emailStatus["email"]}. Kindly verify to proceed.", "success": True}
    else:
        return {"message": "Failed to send verification mail, try again later.", "success": False}




@router.post("/verify-email")
async def verify_email(request: Request):
    data = await request.json()
    token = data.get("token")

    if not token: 
        raise HTTPException(status_code=400, detail="Token is required")
    
    # find and validate token
    token_doc = await tokens_collection.find_one({"token": token, "used": False, "expires_at": {"$gt": datetime.now(timezone.utc)}}) 

    if not token_doc:
        raise HTTPException(status_code=400, detail="Already used or expired token")

    print("Received token on verify_email route: ", token)

    # find user and update the user as verified in the db
    user = await users_collection.find_one({"email": token_doc["email"]})
    if not user:
        raise HTTPException(status_code = 404, detail =  "User not found with the associated token")

    if user.get("verified"):
        return {"message" : "Email is already verified"}
    
    # await users_collection.update_one({"email": email}, {"$set": {"verified": True}})

    # Update user verificaiotn and mark token as used - transaction 
    async with await users_collection.database.client.start_session() as s:
        async with s.start_transaction():
            await users_collection.update_one({"email": token_doc["email"]}, {"$set": {"verified": True, "verified_at": datetime.now(timezone.utc)}})
            await tokens_collection.update_one({"_id": token_doc["_id"]}, {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}})

    # new response 

    # Generate access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "type": "access"},
        expires_delta=access_token_expires
    )
    
    # Store session token
    await tokens_collection.insert_one({
        "token": access_token,
        "user_id": str(user["_id"]),
        "type": "session",
        # "expires_at": datetime.now(timezone.utc) + access_token_expires,
        "expires_at": jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])["exp"],
        "created_at": datetime.now(timezone.utc)
    })

    # Prepare response with cookie
    response = JSONResponse(content={"message": "Email verified successfully, redirecting."})
    
    # Set secure cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Always use True in production
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=datetime.now(timezone.utc) + access_token_expires,
        samesite="Lax"
    )
    
    return response

    # old response for verify-email
    # return {"message": "Email verified successfully, redirecting."}


@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    print("email: ", email, " password: ", [password] )
    user = LoginRequest(email=email, password=password)
    print(user)
    db_user = await users_collection.find_one({"email": user.email})
    print(db_user)

    # check if the user exists in db (w email)
    if not db_user:
        raise HTTPException(status_code=404, detail='User not found with this email')

    # verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail='Invalid credentials')

    # check email verification
    if not db_user["verified"]:
        raise HTTPException(status_code=403, detail="Access denied: Your email is not verified. Please verify your email to proceed.")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email, "type": "access"}, expires_delta=access_token_expires)
    
     # Store session token
    await tokens_collection.insert_one({
        "token": access_token,
        "user_id": str(db_user["_id"]),
        "type": "session",
        # "expires_at": datetime.now(timezone.utc) + access_token_expires,
        "expires_at": jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])["exp"],
        "created_at": datetime.now(timezone.utc)
    })
    
    response = JSONResponse(content={"message": "Login successful"})
    
    print(response, access_token)

    # Set secure cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Always use True in production
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=datetime.now(timezone.utc) + access_token_expires,
        samesite="Lax"
    )

    return response


# Get all users
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
    content = f"""Hello,  

Please click the below link to verify your email address.

Link: {verification_url}  

If you didn't ask to verify this address, you can ignore this email.

Thank you,  
Your Celestio Team"""
    
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
        return {"message": "Verification email sent", "email": to_email , "success": True}
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"message": "Failed to send verification mail, try again.", "email": to_email, "success": False}
 


 
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_urlsafe(16)
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# creating a verification token at the registration time
async def create_verification_token(email: str, verification_tokens: AsyncIOMotorCollection, expires_delta: timedelta = timedelta(hours=24)):
    """Create and store a verification token"""
    expires_at = datetime.now(timezone.utc) + expires_delta
    token = jwt.encode({"email": email, "exp": expires_at}, SECRET_KEY, algorithm=ALGORITHM)
    
    # store token in db
    await verification_token.insert_one({
        "email" : email,
        "tokem" : token, 
        "expires_at" : expires_at,
        "used" : False
    })

    return token
    
def serialize_user(user) -> dict:
    """Convert MongoDB user document to a Python dictionary."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }