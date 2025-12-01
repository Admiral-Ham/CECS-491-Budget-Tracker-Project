from data.db import db

class UserModel:

    collection = db.userinfo

    @staticmethod
    def get_user_by_email(email: str):
        return UserModel.collection.find_one({"email": email})

    @staticmethod
    def create_user(user_data: dict):
        return UserModel.collection.insert_one(user_data)