import os
import io
import uuid
import json
import logging
import tempfile
from typing import Annotated
from pinecone import Pinecone
from jose import JWTError, jwt
from pydantic import BaseModel
from dotenv import load_dotenv
from ..database import get_db_data
from starlette.requests import Request
from .. import models, services, schemas
from fastapi.responses import JSONResponse
from pdfminer.high_level import extract_text
from fastapi.encoders import jsonable_encoder
from sse_starlette.sse import EventSourceResponse
from pinecone_plugins.assistant.models.chat import Message
from ..utils.helpers import update_primary_assistant, get_primary_assistant
from app.db.database import users_collection, tokens_collection
from fastapi import APIRouter, Body, Depends, UploadFile, File, HTTPException, Form
from cryptography.fernet import Fernet

router = APIRouter()

load_dotenv()
NAMESPACE_UUID = uuid.UUID(os.getenv("NAMESPACE_UUID"))
# pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
ASSISTANT_NAME = "default"
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
DATA_FOLDER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_FOLDER_PATH, exist_ok=True)
SECRET_KEY = "thisismysecret"
ALGORITHM="HS256"


# Encryption setup
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    import base64
    import hashlib
    # Fallback for development - DO NOT use in production
    ENCRYPTION_KEY = base64.urlsafe_b64encode(hashlib.sha256(SECRET_KEY.encode()).digest())
    logger.warning("Using derived encryption key from SECRET_KEY. Set ENCRYPTION_KEY in production.")

cipher_suite = Fernet(ENCRYPTION_KEY)

# Encryption/decryption functions
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
        logger.error(f"Error decrypting API key: {str(e)}")
        raise ValueError("Failed to decrypt API key")

# Initialize Pinecone with user's API key
async def init_pinecone(user_email: str) -> Pinecone:
    """Initialize Pinecone with the user's API key"""

    print("running init pinecone")
    
    try:
        # Get the user's encrypted API key from the database
        user_data = await users_collection.find_one({"email": user_email})

        print("user data from init pinecone")
        print(user_data)

        if not user_data or "pinecone_apiKey" not in user_data:
            logger.warning(f"No Pinecone API key found for user: {user_email}")
            raise ValueError("No Pinecone API key found. Please add your API key first.")
        
        # Decrypt the API key
        encrypted_api_key = user_data["pinecone_apiKey"]
        api_key = decrypt_api_key(encrypted_api_key)
        
        # Initialize Pinecone with user's API key
        return Pinecone(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Pinecone client: {str(e)}")
        raise ValueError(f"Failed to initialize Pinecone: {str(e)}")


async def create_assistant_by_name(assistantName: str):
    """Creates a new assistant with the given name"""

    print(f"Inside the create assistant function & Creating assistant with name: {assistantName}")

    try:
        pc = await init_pinecone(user_email)
        assistant = pc.assistant.create_assistant(
            assistant_name=assistantName,
            instructions="You are AIPlanet's assistant and are extremely polite.",
            timeout=30,
        )
        logging.info(f"Assistant '{assistantName}' created successfully.")
        return assistant
    except Exception as e:
        logging.error(f"Error while creating assistant '{assistantName}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while creating assistant '{assistantName}': {str(e)}")



async def get_or_create_assistant(assistantName: str, user_email: str):
    """
    Checks if the assistant exists; if not, creates a new one using createassistantbyname function.
    Returns the assistant instance.
    """
 
    print("inside get or create assistant and assistantName: ", assistantName)

    # Sanitize and format assistant name -> changes in a format -> aryankarma29---ass1
    sanitized_email = user_email.replace("@gmail.com", "")
    full_assistant_name = f"{sanitized_email}---{assistantName}".lower()

    print(f"Checking existence for assistant: {full_assistant_name}")

    # List all existing assistants
    print("getting pc")

    pc = await init_pinecone(user_email)
    
    print("pc")
    print(pc)

    assistants = pc.assistant.list_assistants()
    assistant_names = [assistant.name for assistant in assistants]
    print("Existing assistants:", assistant_names)

    # Search for assistant
    for assistant in assistants:
        if assistant.name == full_assistant_name:
            print(f"Assistant '{full_assistant_name}' found.")
            return pc.assistant.Assistant(assistant_name=full_assistant_name)

    # If not found, create new
    print(f"Assistant '{full_assistant_name}' not found. Creating new assistant...")
    return create_assistant_by_name(full_assistant_name)



async def get_current_user(request: Request):
    """Extracts user info from the JWT token stored in cookies"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    print("getting current user")
    print("token: ", token)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("payload: ", payload)
        email: str = payload.get("sub")
        print("email of current user: ", email)
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


class assistantRoute(BaseModel):
    assistantName: str


@router.post("/createAssistant")
async def create_assistant(
    assistantName: str = Form(...),
    user_email: str = Depends(get_current_user)
) -> JSONResponse:

    await get_or_create_assistant(assistantName, user_email)
    return JSONResponse(content={"message": f"Assistant '{assistantName}' created successfully.", "status": 200})


@router.get("/checkPineconeConnectStatus")
async def checkPineconeConnectStatus(user_email: str = Depends(get_current_user)) -> JSONResponse:
    """check if pinecone api is connected or not also sends the api key"""

    try:
        # Get the user's encrypted API key from the database
        user_data = await users_collection.find_one({"email": user_email})

        if not user_data or "pineconeConnect" not in user_data:
            logger.warning(f"No Pinecone connection status found for user: {user_email}")
            raise ValueError("No Pinecone connection status found. Please add your API key first.")

        decryptedApiKey = user_data["pinecone_apiKey"] = decrypt_api_key(user_data["pinecone_apiKey"])

        # Check if the Pinecone connection is established
        pinecone_connect_status = user_data["pineconeConnect"]

        return JSONResponse(content={
            "success": True,
            "message": "Pinecone connection status retrieved successfully.",
            "apiKey": decryptedApiKey,
            "status": pinecone_connect_status
        })
    except Exception as e:
        logger.error(f"Error checking Pinecone connection status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check Pinecone connection status")


@router.post("/add_pinecone")
async def savePineconeApiKey(
    apiKey: str = Form(...),
    user_email: str = Depends(get_current_user)
) -> JSONResponse:
    """Get Api key from frontend and save in DB"""
    try:

        print("data: ", apiKey, user_email)

        encrypted_api_key = encrypt_api_key(apiKey)

        # Save the API key in the database
        success = await users_collection.update_one(
            {"email": user_email},
            {"$set": {"pinecone_apiKey": encrypted_api_key, "pineconeConnect": True}}
        )

        print("success:", success)

        if success.matched_count == 0:
            logging.error(f"No matching user found for email: {user_email}")
            return False

        # Verify the API key works with Pinecone before confirming success
        try:
            # Get a temporary Pinecone client to verify the API key works
            from pinecone import Pinecone
            temp_pc = Pinecone(api_key=apiKey)
            # Try a simple operation to verify the API key is valid
            indexes = temp_pc.list_indexes()
            logging.info(f"Pinecone API key verified successfully for user: {user_email}")
        except Exception as e:
            logging.error(f"Invalid Pinecone API key provided: {str(e)}")
            # If the key doesn't work, remove it from the database
            await users_collection.update_one(
                {"email": user_email},
                {"$unset": {"pinecone_apiKey": "", "pineconeConnect" : False}}
            )
            
            return JSONResponse(content={
                "success": False,
                "message": "Invalid Pinecone API key"
            })

        return JSONResponse(content={
            "success": True,
            "message": f"Api key saved in db for user {user_email}"
        })

    except Exception as e:
        logging.error(f"Error saving API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save API key")


@router.post("/updatePrimaryAssistant")
async def update_primary_assistant_route(
    assistantName: str = Form(...),
    user_email: str = Depends(get_current_user)
) -> JSONResponse:
    """Securely updates the primary assistant for a user"""

    print("data: ", assistantName, user_email)
    success = await update_primary_assistant(user_email, assistantName)

    if success:
        return JSONResponse(content={
            "success": True,
            "message": f"Primary assistant updated to {assistantName}"
        })
    else:
        raise HTTPException(status_code=500, detail="Failed to update primary assistant")


@router.post("/savePdf")
async def save_pdf(file: UploadFile = File(...), user_email: str = Depends(get_current_user)):
    """Uploads a PDF and stores it in the Pinecone assistant."""
    try:
        assistant_name = await get_primary_assistant(user_email)
        assistant = await get_or_create_assistant(assistant_name, user_email)
        print("final assistant is : ", assistant)
        print("assistant got: ", assistant)
        print("stored in local")
        temp_file_path = os.path.join(DATA_FOLDER_PATH, file.filename)
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(await file.read())

        print("uploading file... ")
        response = assistant.upload_file(file_path=temp_file_path)

        print("uploading done. ")
        
        os.remove(temp_file_path)
        print("deleted from local")

        response_dict = {"message": str(response)}

        return {"message": f"PDF '{file.filename}' uploaded successfully.", "response": response_dict}

    except Exception as e:
        logger.error(f"Error: {str(e).strip()}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/ask_question")
async def ask_question(message: str = Form(...), chat_history: str = Form(default="[]"), user_email: str = Depends(get_current_user)):
    """Handles user questions and sends them to the Pinecone assistant."""
    
    try:
        assistant_name = await get_primary_assistant(user_email)
        assistant = await get_or_create_assistant(assistant_name, user_email)
        
        # Parse chat history from JSON string
        history = json.loads(chat_history)

        print(assistant_name)
        print(assistant)
        print("loading history: ")
        # print(history)

        # Convert history to Message objects
        chat_messages = []
        for msg in history:
            # print(msg)
            role = "user" if msg.get("sender") == "user" else "assistant"
            chat_messages.append(Message(content=msg["text"], role=role))

        # add the current message
        chat_messages.append(Message(content=message, role="user"))

        print('chat messages: ', chat_messages)

        # msg = Message(content=message)
        response = assistant.chat(messages=chat_messages)
            
        return {"message": str(response.message.content)}
    
    except Exception as e:
        logging.error(f"Error while processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while processing question: {str(e)}")


@router.get("/stream_question")  # Use GET for SSE (Form not needed in SSE, data goes as query param)
async def stream_question(message: str, user_email: str = Depends(get_current_user)):
    """Stream response for a user question."""

    try:
        assistant_name = await get_primary_assistant(user_email)
        assistant = await get_or_create_assistant(assistant_name, user_email)

        msg = Message(role="user", content=message)
        response = assistant.chat(messages=[msg], stream=True)  # Streaming response from Pinecone

        async def event_generator():
            try:
                for chunk in response:
                    if chunk and chunk.message and chunk.message.content:
                        yield {
                            "event": "message",
                            "data": chunk.message.content
                        }
            except Exception as stream_error:
                logging.error(f"Streaming error: {str(stream_error)}")
                yield {
                    "event": "error",
                    "data": f"Streaming error: {str(stream_error)}"
                }

        return EventSourceResponse(event_generator())

    except Exception as e:
        logging.error(f"Error while processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while processing question: {str(e)}")



#  helper function to properly send the documents data to the frontend
def safe_serialize(obj):
    """Helper function to safely serialize objects to dictionaries.
    Handles cases where objects have attributes that are not serializable."""
    try:
        # Convert objects with __dict__ to dictionaries
        if hasattr(obj, "__dict__"):
            return {key: safe_serialize(value) for key, value in vars(obj).items()}
        # Handle lists and iterables
        elif isinstance(obj, list):
            return [safe_serialize(item) for item in obj]
        # Handle primitive types directly
        elif isinstance(obj, (int, float, str, bool, type(None))):
            return obj
        # Fallback for unsupported types
        else:
            return str(obj)  # Convert to string for non-serializable objects
    except Exception as e:
        logging.error(f"Serialization error: {e}")
        return str(obj)


@router.post("/fetchDocs")
async def fetch_documents(assistantName: str = Form(...), user_email: str = Depends(get_current_user)) -> JSONResponse:
    """Fetches documents uploaded to the given assistant."""
    try:

        # Remove surrounding quotes if present
        if assistantName.startswith('"') and assistantName.endswith('"'):
            assistantName = assistantName[1:-1]
        elif assistantName.startswith("'") and assistantName.endswith("'"):
            assistantName = assistantName[1:-1]


        assistant = await get_or_create_assistant(assistantName, user_email)

        # Initialize the assistant instance
        # assistant = pc.assistant.Assistant(assistant_name=assistantName)
        
        # Fetch files and debug their structure
        files = assistant.list_files()
        # print(f"Raw files fetched: {files}")
        print("Fetching docs")
        
        # Safely serialize files
        serialized_files = safe_serialize(files)

        # Ensure JSON compatibility
        json_compatible_files = jsonable_encoder({"files": serialized_files})

        return JSONResponse(content=json_compatible_files)

    except Exception as e:
        # Log and raise an HTTP exception on error
        logging.error(f"Error while fetching documents from assistant '{assistantName}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error while fetching documents: {str(e)}"
        )


@router.post("/deleteDoc")
async def delete_document(docID: str = Form(...), assistantName:str = Form(...), user_email: str = Depends(get_current_user)) -> JSONResponse:
    """Deletes a document from pinecone assistant by recieving the doc id"""
    
    try:
        # print("Deleting doc with id ", docID)
        assistant = await get_or_create_assistant(assistantName, user_email)
        # assistant = pc.assistant.Assistant(assistant_name=assistantName)
        response = assistant.delete_file(file_id=docID)
        print("deleted.")
        return JSONResponse(response)
    
    except Exception as e:
        logging.error(f"Error while deleting document with ID {docID} from assistant {assistantName}, error : ", {str(e)})
        raise HTTPException(status_code=500, detail=f"Error while deleting document: {str(e)} ")


@router.post("/deleteAssistant")
async def getAssistants(assistantName: str = Form(...), user_email: str = Depends(get_current_user)) -> JSONResponse:
    """Deletes an assistant"""
    try:
        print(f"deleting assistant: {assistantName}")

        # Sanitize and format assistant name -> changes in a format -> aryankarma29---ass1
        sanitized_email = user_email.replace("@gmail.com", "")
        full_assistant_name = f"{sanitized_email}---{assistantName}".lower()
        
        pc = await init_pinecone(user_email)

        deletedAssistantResponse = pc.assistant.delete_assistant(
            assistant_name=full_assistant_name, 
        )
        print("Successfully deleted assistant, response: ", deletedAssistantResponse)
        serialized_Response = safe_serialize(deletedAssistantResponse)
        json_compatible_response = jsonable_encoder({"assistants": serialized_Response})
        return JSONResponse(content=json_compatible_response)
    
    except Exception as e:
        logging.error(f"Error while deleting assistant: {assistantName}, error :, {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while deleting assistant: {assistantName}, error: {str(e)}")




@router.post("/getAssistants")
async def getAssistants(user_email: str = Depends(get_current_user)) -> JSONResponse:
    """
    Fetch all assistants and return only those associated with the logged-in user.
    """

    try:
        print(f"Fetching assistants for user: {user_email}")

        pc = await init_pinecone(user_email)
        allAssistants = pc.assistant.list_assistants()

        # Extract user's unique prefix (email before @gmail.com)
        user_prefix = user_email.replace("@gmail.com", "").lower()
        print(f"User prefix: {user_prefix}")
        print("All assistants fetched:", [assistant.name for assistant in allAssistants])

        # Filter assistants whose 'name' starts with user_prefix followed by '---'
        filtered_assistants = [
            assistant for assistant in allAssistants
            if assistant.name.startswith(f"{user_prefix}---")
        ]

        print(f"Filtered assistants for user '{user_prefix}': {[a.name for a in filtered_assistants]}")

        # Serialize and return filtered assistants
        serialized_assistants = safe_serialize(filtered_assistants)
        json_compatible_assistants = jsonable_encoder({"assistants": serialized_assistants})
        return JSONResponse(content=json_compatible_assistants)

    except Exception as e:
        logging.error(f"Error while fetching assistants for user {user_email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while fetching assistants for user {user_email}: {str(e)}")
