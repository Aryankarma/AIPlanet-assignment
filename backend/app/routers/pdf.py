import os
import io
import uuid
import json
import logging
import tempfile
from pinecone import Pinecone
from typing import Annotated
from dotenv import load_dotenv
from ..database import get_db_data
from .. import models, services, schemas
from fastapi.responses import JSONResponse
from pdfminer.high_level import extract_text
from fastapi.encoders import jsonable_encoder
from pinecone_plugins.assistant.models.chat import Message
from fastapi import APIRouter, Body, Depends, UploadFile, File, HTTPException, Form
from ..utils.helpers import update_primary_assistant, get_primary_assistant
from starlette.requests import Request
from pydantic import BaseModel
from jose import JWTError, jwt
from sse_starlette.sse import EventSourceResponse

router = APIRouter()

load_dotenv()
NAMESPACE_UUID = uuid.UUID(os.getenv("NAMESPACE_UUID"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
ASSISTANT_NAME = "default"
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
DATA_FOLDER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_FOLDER_PATH, exist_ok=True)
SECRET_KEY = "thisismysecret"
ALGORITHM="HS256"


def create_assistant_by_name(assistantName: str):
    """Creates a new assistant with the given name"""

    print(f"Inside the create assistant function & Creating assistant with name: {assistantName}")

    try:
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



def get_or_create_assistant(assistantName: str, user_email: str):
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

    get_or_create_assistant(assistantName, user_email)
    return JSONResponse(content={"message": f"Assistant '{assistantName}' created successfully.", "status": 200})


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
        assistant = get_or_create_assistant(assistant_name, user_email)
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
        assistant = get_or_create_assistant(assistant_name, user_email)
        
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
        assistant = get_or_create_assistant(assistant_name, user_email)

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


        assistant = get_or_create_assistant(assistantName, user_email)

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
        assistant = get_or_create_assistant(assistantName, user_email)
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
