from config.db import db
from schemas.users_schema import User
from pydantic import ValidationError
users_collection = db.users

def create_user(data):
    """Inserting a new document for user"""
    return users_collection.insert_one(data)

def validate_user(data: dict):
    """
    Validates user data. 
    
    Inputs: Data = Dictionary

    Returns:
            On Success:
                        Returns dictionary with success and user_doc keys
                        user_doc returned is a MongoDB acceptable dictionary
            On FailureL:
                        Returns dictionary with error and error message
    """
    user_doc = {}
    try: 
        user = User.model_validate(data)
        user_doc = user.model_dump(by_alias=True, exclude_none=True)
        return {"success": True, "message":"User validated and created", "return": user_doc}
    except ValidationError as e:
        return {"success": False,"message":"Missing required fields", "return": user_doc}

def unique_email(data: dict):
    """
    Checks if the email is unique
    """
    email = data.get("email")
    
    result = users_collection.find_one({"email": email})
    return result is None

def get_all_users():
    """"returns all user documents"""
    return list(users_collection.find())