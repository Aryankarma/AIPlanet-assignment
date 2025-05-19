from app.db.database import users_collection, tokens_collection
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import base64
import hashlib
from fastapi import APIRouter, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging


load_dotenv()
ASSISTANT_NAME="default"

async def get_primary_assistant(email: str) -> str:
    """Get a user's primary assistant from email"""
    try:
        # find the user
        print("finding user with email", email)
        user = await users_collection.find_one({"email": email})
        if user:
            print("found user.")
            print(user["name"]) 
            if "primary_assistant" in user:
                print("got primary assistant in db", user["primary_assistant"])
                return user["primary_assistant"]
            else:
                print("unable to find primary assistant in db.")
                return ASSISTANT_NAME
        else:
            print("User not found.")
            return ASSISTANT_NAME
            
    except Exception as e:
        logging.error(f"Error getting primary assistant: {str(e)}")
        return ASSISTANT_NAME


async def update_primary_assistant(email: str, assistantName: str) -> bool:
    """Updates a user's primary assistant in the DB"""
    print("updating primary assistant for:", email, assistantName)
    try:
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"primary_assistant": assistantName}}
        )
        print("result:", result)

        if result.matched_count == 0:
            logging.error(f"No matching user found for email: {email}")
            return False

        # Return True if at least one document matched, even if no fields were changed.
        logging.info(f"Updated primary assistant: {result.modified_count}")
        return result.matched_count > 0

    except Exception as e:
        logging.error(f"Error updating primary assistant: {str(e)}")
        return False

# Set up encryption key - store this securely in environment variables
# Generate a key with: Fernet.generate_key() and save to your env
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # For development only - in production, always use env variables
    # This creates a deterministic key based on your SECRET_KEY for development
    # DO NOT use this in production
    ENCRYPTION_KEY = base64.urlsafe_b64encode(hashlib.sha256(os.getenv("SECRET_KEY").encode()).digest())

# Initialize the Fernet cipher
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_api_key(api_key: str) -> str:
    """Encrypt the API key before storing in the database"""
    encrypted_key = cipher_suite.encrypt(api_key.encode())
    return encrypted_key.decode()

def decrypt_api_key(encrypted_api_key: str) -> str:
    """Decrypt the API key retrieved from the database"""
    try:
        decrypted_key = cipher_suite.decrypt(encrypted_api_key.encode())
        return decrypted_key.decode()
    except Exception as e:
        logging.error(f"Error decrypting API key: {str(e)}")
        raise ValueError("Failed to decrypt API key")