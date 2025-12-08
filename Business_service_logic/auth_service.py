# services/auth_service.py

from data.user_model import UserModel
from utils.hashing import Hasher
from datetime import datetime


class AuthService:

    @staticmethod
    def register(data: dict) -> dict:
        """Handles new user registration logic."""
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return {"success": False, "message": "All fields are required"}

        existing = UserModel.get_user_by_email(email)
        if existing:
            return {"success": False, "message": "Email already registered"}

        hashed = Hasher.hash_password(password)

        new_user = {
            "name": name,
            "email": email,
            "password_hash": hashed,
            "creation_time": datetime.utcnow().isoformat(),
            "transactions": [],
            "goals": [],
            "analytics": {}
        }

        UserModel.create_user(new_user)
        return {"success": True, "message": "User registered"}

    @staticmethod
    def login(data: dict) -> dict:
        """Validates user login."""
        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return {"success": False, "message": "Email and password required"}

        user = UserModel.get_user_by_email(email)
        if not user:
            return {"success": False, "message": "User not found"}

        if not Hasher.verify_password(password, user["password_hash"]):
            return {"success": False, "message": "Incorrect password"}

        return {
            "success": True,
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "name": user["name"]
        }
