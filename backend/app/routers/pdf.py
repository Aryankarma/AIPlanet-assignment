import os
import io
import uuid
import logging
import tempfile
from pinecone import Pinecone
from typing import Annotated
from dotenv import load_dotenv
from ..models import PdfDocument
from sqlalchemy.orm import Session
from ..database import get_db_data
from .. import models, services, schemas
from pdfminer.high_level import extract_text
from fastapi import APIRouter, Body, Depends, UploadFile, File, HTTPException, Form
from pinecone_plugins.assistant.models.chat import Message
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

router = APIRouter()

load_dotenv()
NAMESPACE_UUID = uuid.UUID(os.getenv("NAMESPACE_UUID"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
ASSISTANT_NAME = "aiplanetassistant"
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
DATA_FOLDER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_FOLDER_PATH, exist_ok=True)


def get_or_create_assistant(assistant_name: str):
    """Checks if the assistant exists or creates a new one."""
    assistants = pc.assistant.list_assistants()

    assistant_names = []
    for assistant in assistants:
        assistant_names.append(assistant.name) 
    print("Listing assistants: ", assistant_names)

    assistant_found = None
    for assistant in assistants:
        if assistant.name == assistant_name:
            assistant_found = assistant
            break
    
    if assistant_found:
        print(f"Assistant '{assistant_name}' found.")
        assistant = pc.assistant.Assistant(assistant_name=assistant_name)
    else:
        print(f"Creating assistant '{assistant_name}'...")
        assistant = pc.assistant.create_assistant(
            assistant_name=assistant_name,
            instructions="You are AIPlanet's assistant and are extremely polite.",
            timeout=30,
        )
        print(f"Assistant '{assistant_name}' created.")
    
    return assistant


@router.post("/savePdf")
async def save_pdf(file: UploadFile = File(...)):
    """Uploads a PDF and stores it in the Pinecone assistant."""
    try:
        assistant = get_or_create_assistant(ASSISTANT_NAME)
    
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
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/ask_question")
async def ask_question(message: str = Form(...)):
    """Handles user questions and sends them to the Pinecone assistant."""
    
    try:
        print("chatting with assistant")
        assistant = get_or_create_assistant(ASSISTANT_NAME)
        msg = Message(content=message)
        response = assistant.chat(messages=[msg])
        
        print(response.message)
            
        return {"message": str(response.message.content)}
    
    except Exception as e:
        logging.error(f"Error while processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while processing question: {str(e)}")


# @router.post("/fetchDocs")
# async def fetchDocuments(assistantName: str = Form(...)) -> dict:
#     """Takes the Assistant name and sends all the documents uploaded to it."""

#     try:
#         assistant = pc.assistant.Assistant(
#             assistant_name=assistantName, 
#         )
#         files = assistant.list_files()
#         logging.info(f"Files fetched: {files}") 
#         return {"files": str(files)}

#     except Exception as e:
#         logging.error(f"Error while fetching documents from assistant '{assistantName}': {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error while fetching documents: {str(e)}"
#         )3. 


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
async def fetch_documents(assistantName: str = Form(...)) -> JSONResponse:
    """Fetches documents uploaded to the given assistant."""
    try:
        # Initialize the assistant instance
        assistant = pc.assistant.Assistant(assistant_name=assistantName)
        
        # Fetch files and debug their structure
        files = assistant.list_files()
        print(f"Raw files fetched: {files}")
        logging.info(f"Raw files fetched: {files}")
        
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
async def delete_document(docID: str = Form(...), assistantName:str = Form(...)) -> JSONResponse:
    """Deletes a document from pinecone assistant by recieving the doc id"""
    
    try:
        print("Deleting doc with id ", docID)
        assistant = pc.assistant.Assistant(assistant_name=assistantName)
        response = assistant.delete_file(file_id=docID)
        print("deleted.")
        return JSONResponse(response)
    
    except Exception as e:
        logging.error(f"Error while deleting document with ID {docID} from assistant {assistantName}, error : ", {str(e)})
        raise HTTPException(status_code=500, detail=f"Error while deleting document: {str(e)} ")
    
    

@router.post("/deleteAssistant")
async def getAssistants(assistantName: str = Form(...)) -> JSONResponse:
    """Deletes an assistant"""
    try:
        print(f"deleting assistant: {assistantName}")
        deletedAssistantResponse = pc.assistant.delete_assistant(
            assistant_name=assistantName, 
        )
        print("Successfully deleted assistant, response: ", deletedAssistantResponse)
        serialized_Response = safe_serialize(deletedAssistantResponse)
        json_compatible_response = jsonable_encoder({"assistants": serialized_Response})
        return JSONResponse(content=json_compatible_response)
    
    except Exception as e:
        logging.error(f"Error while deleting assistant: {assistantName}, error :, {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while deleting assistant: {assistantName}")


# make sure to add the association for each user name with assistant while making and rendering according to the name
@router.post("/getAssistants")
async def getAssistants(userName: str = Form(...)) -> JSONResponse:
    """Fetch all the assistants created and then returns assistant that are associated with the particular user name"""

    try:
        print(f"fetching assistants for {userName}")
        allAssistants = pc.assistant.list_assistants()
        print("assistant fetched, allAssistants : ", allAssistants)
        serialized_assistants = safe_serialize(allAssistants)
        json_compatible_assistants = jsonable_encoder({"assistants": serialized_assistants})
        return JSONResponse(content=json_compatible_assistants)
    
    except Exception as e:
        logging.error(f"Error while fetching assistants, for username {userName}, error :, {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error while fetching assistants, for username {userName}")