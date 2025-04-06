from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    name: str
    email: str
    password: str
    verified: bool = False
    pineconeConnect: bool = False
    primary_assistant: str = "default"
    created_at: datetime = datetime.now()

class Token(BaseModel):
    token: str
    email: str
    type : str  # "email_verification" or "session"
    expires_at: datetime
    used: bool = False
    user_id: str | None = None  # Optional, used for session tokens

class LoginRequest(BaseModel):
    email: str
    password: str