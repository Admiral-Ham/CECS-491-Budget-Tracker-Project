from utils.hashing import verify_password, hash_password
from uuid import uuid4

class AuthService:

    @staticmethod
    def validate_registration(data):
        if "email" not in data or "password" not in data or "name" not in data:
            return {"success": False, "message": "Missing fields"}
        if len(data["password"]) < 6:
            return {"success": False, "message": "Password must be at least 6 characters"}
        return {"success": True, "message": "Registration successful"}

    @staticmethod
    def validate_login(user, password):
        if not user:
            return {"success": False, "message": "Email not found"}

        if not verify_password(password, user["password_hash"]):
            return {"success": False, "message": "Incorrect password"}

        token = str(uuid4())

        return {
            "success": True,
            "token": token,
            "user_id": str(user["id"]),
            "name": user["name"],
        }
