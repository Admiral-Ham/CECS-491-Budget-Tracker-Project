import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "budget_tracker") 
                     
client = MongoClient(MONGO_URI)
db = client[DB_NAME]


#def get_db(): MongoDB connection setup
#client = MongoClient("mongodb+srv://technicsolutions:technicsolutions491a@technicsolutions.kpxzyep.mongodb.net/?retryWrites=true&w=majority&appName=TechnicSolutions")
    # reads the connection string of the mongo client
#db = client["budget_tracker"]
    # db object to identify the client and object db imported by other modules



