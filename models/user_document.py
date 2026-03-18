from pymongo import IndexModel, ASCENDING
from pydantic import EmailStr, Field, BaseModel
from beanie import  Document
from datetime import datetime, UTC

class User(Document):
    # Name and email need to be unique
    name:           str
    email:          EmailStr
    password_hash:  str
    creation_time:  datetime = Field(default_factory=datetime.now(UTC))

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }
    class UserProjection(BaseModel):
        name: str
        email: EmailStr
        creation_time: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        #validation_on_save = True  # Expensive Operation might not be need
        indexes = [
            IndexModel(
                [("name", ASCENDING)],
                name = "unique_name",
                unique = True
            ),
            IndexModel(
                [("email", ASCENDING)],
                name = "unique_email",
                unique = True
            )
        ]
