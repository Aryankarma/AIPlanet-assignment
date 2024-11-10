import os
import io
import uuid
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


router = APIRouter()

load_dotenv()
NAMESPACE_UUID = uuid.UUID(os.getenv("NAMESPACE_UUID"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


@router.post("/uploadPdf2")
async def upload_file2(
    message: str = Form(...), 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db_data)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    # Read file and extract text
    file_content = await file.read()
    pdf_file = io.BytesIO(file_content)
    extracted_text = extract_text(pdf_file)

    filename = file.filename
    pdf_id = str(uuid.uuid3(NAMESPACE_UUID, filename))

    # Check if the file already exists in the database
    existing_pdf = db.query(PdfDocument).filter(PdfDocument.id == pdf_id).first()
    if existing_pdf:
        print("File already exists.")
        raise HTTPException(status_code=400, detail="File already exists.")

    new_pdf = PdfDocument(
        id=pdf_id,
        filename=filename,
        message=message,
        pdf_text=extracted_text
    )

    db.add(new_pdf)
    db.commit()
    db.refresh(new_pdf)

    return {
        "message": "File uploaded and data saved successfully.",
        "data": {
            "filename": filename,
            "message": message,
            "pdf_text": extracted_text
        }
    }
    
    
@router.post("/savePdf")
async def save_pdf_in_vector(file: Annotated[UploadFile, File()]):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    assistant1 = pc.assistant.create_assistant(
        assistant_name="aiplanetassistant", 
        instructions="You are AI Planet company's assistant and are extremely polite.",
        timeout=30
    )
    
    assistantStatus = pc.assistant.get_assistant(
        assistant_name="aiplanetassistant", 
    )
    
    print(assistantStatus.status) # shows assitant status and other details
    
    
    # print("assistant", assistant)
    

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    try:
        # Upload the temporary file
        response = assistant.upload_file(
            file_path=temp_file_path,
        )
        print("response:", response)

        # List files in the assistant
        print("myAssistant files:", assistant.list_files())
    finally:
        # Remove the temporary file after upload
        os.remove(temp_file_path)

    return {"status": "file uploaded successfully", "response": response}



# @router.post("/uploadPdf")
# async def upload_file(message: str = Form(...), file: UploadFile = File(...)):
#     if not file:
#         return {"error": "No file uploaded."}
    
#     if file.content_type != 'application/pdf':
#         return {"error": "Invalid file type. Please upload a PDF."}

#     file_content = await file.read()
#     pdf_file = io.BytesIO(file_content)
#     extracted_text = extract_text(pdf_file)

#     return {
#         "message": "File received successfully",
#         "data": {
#             "text": message,
#             "pdf_text": extracted_text
#         }
#     }

 
@router.post("/ask_question/{pdf_id}")
async def ask_question(pdf_id: int, request: schemas.QuestionRequest, db: Session = Depends(get_db_data)):
    # Fetch the PDF document from the database
    pdf_doc = db.query(PdfDocument).filter(PdfDocument.id == pdf_id).first()
    if not pdf_doc:
        raise HTTPException(status_code=404, detail="PDF document not found")

    # Process the question
    answer = services.process_question(request.question, pdf_doc.text_content)
    return {"answer": answer}