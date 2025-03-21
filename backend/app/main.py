from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, pdf
# for token validation
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.db.database import users_collection, tokens_collection
from datetime import datetime, timezone

ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60
SECRET_KEY = "thisismysecret" 
ALGORITHM = "HS256"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # You can specify ["GET", "POST"] for tighter security
    # allow_headers=["*"],  # Make sure to include necessary headers
    expose_headers=["Content-Type"],  # Expose SSE-specific headers if needed
)


# move this func to another folder for better code readability
async def validate_token(request: Request, call_next):
    # Excempt some routes from token validation
    excempt_routes = ["/auth/login", "/auth/register", "/auth/verify-email", "/auth/resend-verify-email"]
    if request.url.path in excempt_routes:
        response = await call_next(request)
        print("we are in excempted routes")
        return response

    # Get the token from cookie
    token = request.cookies.get("access_token")

    # Print detailed request information
    print("\n========== Request Details ==========")
    print(f"🔹 Method: {request.method}")
    print(f"🔹 URL: {request.url}")
    print(f"🔹 Headers: {dict(request.headers)}")  # Convert Headers to Dictionary
    print(f"🔹 Cookies: {request.cookies}") # Print All Cookies
    try:
        request_body = await request.json() # Extract request body if available
        print(f"🔹 Body: {request_body}")
    except Exception:
        print("🔹 Body: No JSON body found")
    print("=====================================\n")


    if not token:
        raise HTTPException(status_code=401, detail="Access token is missing.")

    try:
        # validate the token by decoding
        payload = decode_access_token(token)
        current_timestamp = int(datetime.now(timezone.utc).timestamp())

        # Query the database for the token
        token_doc = await tokens_collection.find_one({
            "token": token,
            "type": "session",
            "expires_at": {"$gt": current_timestamp}
        })

        if not token_doc:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")

        request.state.user = payload

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

    response = await call_next(request)
    return response        


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")



app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(pdf.router)
app.middleware("http")(validate_token)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/greet/{name}")
def greet_user(name: str):
    return {"message": f"Hey {name}"}