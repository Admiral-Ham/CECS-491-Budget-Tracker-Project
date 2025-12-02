from data.db import db
from  user_services.user_managements import create_user, get_all_users, validate_user, unique_email

def add_user_service(data: dict):
    """
    Adds user data.

    Inputs: data = dictionary

    Returns:
            User_id = int
    """
    valid_user = validate_user(data)
    if not valid_user.get("success"): #if success = False, triggers if statement and returns an error message
        return valid_user.get("message")
    
    if not unique_email(valid_user.get("return")):
        return {"error": "Email not Unique"}
    else:
        create_user(valid_user.get("return"))
        
    #if "email" not in data or "name" not in data:
        #return {"error": "Missing required fields"}
    
def list_users_service():
    """
    Return a list of all users 
    """
    users = get_all_users()
    for user in users:
        user["_id"] = str(user["_id"])
    return users