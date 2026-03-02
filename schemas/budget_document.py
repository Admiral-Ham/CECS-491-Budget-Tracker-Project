from pymongo import IndexModel, ASCENDING
from beanie import  Document, Link, BackLink
from datetime import datetime
from user_document import User
from category_document import Category

class Budget(Document):
    user_id:        Link[User] # Store user_id
    categories: BackLink[Category] # forward reference to category in budget
    name:           str
    creation_time:  datetime

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