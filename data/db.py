from pymongo import MongoClient
from config.settings import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
# Testing connection
try:
    client.admin.command("ping")
    print("Connected to MongoDB successfully.")
except Exception as e:
    print("MongoDB connection failed:", e)

