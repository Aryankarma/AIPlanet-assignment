from app.database import Base, engine
from app.models import PdfDocument
from sqlalchemy import inspect

# Check if the table exists, then drop it if it does
inspector = inspect(engine)
if 'pdf_documents' in inspector.get_table_names():
    PdfDocument.__table__.drop(engine)
    print("Existing pdf_documents table dropped.")

# Recreate the table with the updated schema
Base.metadata.create_all(bind=engine)
print("Database table recreated successfully.")
