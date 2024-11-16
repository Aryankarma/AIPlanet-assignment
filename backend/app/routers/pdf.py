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
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from pinecone_plugins.assistant.models.chat import Message

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
