from passlib.context import CryptContext

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "aiassistantDB"
COLLECTION_NAME = "users"
SECRET_KEY = "SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
