from data.user_model import UserModel
from Business_logic.auth_logic import AuthLogic
from utils.hashing import hash_password

class AuthService:

    @staticmethod
    def register(data): # validates input
        val = AuthLogic.validate_registration(data)
        if not val["success"]:
            return val

        if UserModel.get_user_by_email(data["email"]):
            return {"success": False, "message": "User already exists"}

        # register new user object into usermodel data
        new_user = {
            "name": data["name"],
            "email": data["email"],
            "password_hash": hash_password(data["password"]),
        }

        UserModel.create_user(new_user)

        return {"success": True, "message": "User created and registered"}

    @staticmethod
    def login(data):
        user = UserModel.get_user_by_email(data["email"])
        password = data.get("password")

        return AuthLogic.validate_login(user, password)
