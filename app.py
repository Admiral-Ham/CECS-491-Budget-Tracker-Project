from contextlib import asynccontextmanager
from fastapi import FastAPI
from pymongo import AsyncMongoClient
from beanie import init_beanie
from starlette.middleware.cors import CORSMiddleware

#Modules
from config import settings
from models.user_document import User
from routes.user_create import router as user_router

#MONGO_URI = "mongodb://localhost:27017"
#DB_NAME = "budgettracker"

@asynccontextmanager
async def lifespan(_app: FastAPI):
    client = AsyncMongoClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]

    await init_beanie(
        database=db,
        document_models=[User],
    ) #contains document models, can add more document models on initializing beanie
    yield

    await client.aclose()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173", # for frontend - react
        "http://127.0.0.1:3000",
    ], # defines host and port numbers for frontend and backend for in between browser connection.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/users", tags=["users"])

# shows who is logged in, document records to user, filter by user_id

#testing login api
"""@app.post("/login")
def login():
    data = request.json()
    username = data.get("username")
    password = data.get("password")

    if username == "TechnicSolutions" and password == "1234":
        return jsonify({"success": True, "message": "Login Ok"})
    else:
        return jsonify({"success": False, "message": "Login Failed"})"""

