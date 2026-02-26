from pymongo import IndexModel, ASCENDING, DESCENDING
import pydantic
from beanie import  Document, Link
from datetime import datetime
from user_document import User

class Budget(Document):
    user_id: Link[User] # Store user_id
    name: str
    creation_time: datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    class Settings:
        name = "budgets"
        indexes = [
            IndexModel(
                ("creation_time", ASCENDING),
                name = "creation_time",
            )
        ]