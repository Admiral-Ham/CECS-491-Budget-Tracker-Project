from pymongo import IndexModel, ASCENDING, DESCENDING
from pydantic import EmailStr
from beanie import  Document, Indexed
from datetime import datetime

class User(Document):
    # Name and email need to be unique
    name: str
    email: EmailStr
    password_hash: str
    creation_time: datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    class Settings:
        name = "users"
        #validation_on_save = True  # Expensive Operation might not be need
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
