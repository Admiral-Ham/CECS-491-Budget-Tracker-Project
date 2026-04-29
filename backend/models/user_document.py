from pymongo import IndexModel, ASCENDING
from pydantic import EmailStr, Field, BaseModel
from beanie import  Document
from datetime import datetime, UTC

def utc_now():
    return datetime.now(UTC)

class User(Document):
    # Name and email need to be unique
    name:           str
    email:          EmailStr
    password_hash:  str
    password_reset_token: str | None = None
    password_reset_token_expires: datetime | None = None
    creation_time: datetime = Field(default_factory=utc_now)
    creation_time:  datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }
    class UserProjection(BaseModel):
        name: str
        email: EmailStr
        creation_time: datetime = Field(default_factory=utc_now)


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
