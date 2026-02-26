from pymongo import IndexModel, ASCENDING, DESCENDING
from pydantic import BaseModel, EmailStr
from beanie import  Document, Indexed
from datetime import datetime

class User(Document):
    # Name and email need to be unique
    name: str
    email: EmailStr
    password_hash: str
    creation_time: datetime

    class Settings:
        name = "users"
        indexes = [
            IndexModel(
                ("name", ASCENDING),
                name = "unique_name",
                unique = True
            ),
            IndexModel(
                ("email", ASCENDING),
                name = "unique_email",
                unique = True
            )
        ]
