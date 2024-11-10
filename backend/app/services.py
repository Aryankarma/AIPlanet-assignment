import fitz
from .models import PdfDocument
from sqlalchemy.orm import Session

def save_pdf(file, db:Session):
    filepath = f"data/{file.filename}"
    with open(filepath, 'wb') as f:
        f.write(file.file.read())
        
    textContent = extract_text(filepath)
    
    pdf_doc = PdfDocument(filename=file.filename, textContent=textContent)
    db.add(pdf_doc)
    db.commit()
    db.refresh(pdf_doc)
    return pdf_doc

def extract_text(filepath):
    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    
    return text

def process_question(question, pdf_text):
    if question.lower() in pdf_text.lower():
        return "Yes, this information is in the document"
    return "No relevant information found in this question"

