# services/user_service.py

from data.user_model import UserModel

class UserService:

    @staticmethod
    def get_user(email: str):
        user = UserModel.get_user_by_email(email)
        if not user:
            return {"success": False, "message": "User not found"}

        user["_id"] = str(user["_id"])
        return {"success": True, "user": user}
