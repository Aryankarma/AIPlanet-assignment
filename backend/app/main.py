from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(pdf.router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/greet/{name}")
def greet_user(name: str):
    return {"message": f"Hey {name}"}