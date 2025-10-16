from config.db import db

users_collection = db("users")

def create_user(data):
    """Inserting a new document for user"""
    return users_collection.insert_one(data)

def get_all_users():
    """"returns all user documents"""
    return list(users_collection.find())
