from pydantic import BaseModel

class User(BaseModel):
    name: str
    email: str
    password: str
    verified: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str