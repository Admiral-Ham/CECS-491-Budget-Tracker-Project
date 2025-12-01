from models.user_model import create_user, get_all_users

def add_user_service(data):
    """Validate to add a new user."""
    if "email" not in data or "name" not in data:
        return {"error": "Missing required fields"}

    inserted_id = create_user(data)
    return {"message": "User created", "id": str(inserted_id.inserted_id)}

def list_users_service():
    """return all users in format for frontend"""
    users = get_all_users()
    for user in users:
        user["_id"] = str(user["_id"])
    return users
