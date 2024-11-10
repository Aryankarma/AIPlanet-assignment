from sqlalchemy import Column, Integer, String, Text
from .database import Base

class PdfDocument(Base):
    __tablename__ = "pdf_documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    message = Column(String)
    pdf_text = Column(Text)
