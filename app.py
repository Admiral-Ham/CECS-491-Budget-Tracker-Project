from fastapi import FastAPI
from pymongo import AsyncMongoClient
from beanie import init_beanie

from config import settings
from models import UserDB
#from routes import router as users_router

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "budgettracker"

async def lifespan(app: FastAPI):
    client = AsyncMongoClient(MONGO_URI)
    app.state.mongo_db = client

    await init_beanie(
        database=client[DB_NAME],
        document_models=[UserDB], #[Categories], [Transactions], [Goals], [Budget]
    ) #contains document models, can add more document models on initializing beanie
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(users_router, prefix="/users", tags=["users"])

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

