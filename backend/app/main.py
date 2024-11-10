from fastapi import FastAPI, UploadFile, File, Form
from sqlalchemy.orm import Session
from .routers import pdf
from .database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/greet/{name}")
def read_root(name: str):
    return {"message": f"Hey {name}"}

Base.metadata.create_all(bind=engine)
app.include_router(pdf.router)