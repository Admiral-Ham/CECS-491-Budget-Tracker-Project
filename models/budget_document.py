from datetime import datetime, UTC
from beanie import  Document, Link, BackLink
from pydantic import Field, BaseModel
from pymongo import IndexModel, ASCENDING

from models.user_document import User

def utc_now():
    return datetime.now(UTC)

class Budget(Document):
    user_id: Link[User] # Store user_id
    categories: BackLink["Category"] = Field(original_field="budget_id")
    name: str
    creation_time: datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    class BudgetProjection(BaseModel):
        id: str
        name: str
        creation_time: datetime

    """One user cannot have duplicate budget names and different users can both have same budget names"""
    class Settings:
        name = "budgets"
        indexes = [
            IndexModel(
            [("user_id.$id", ASCENDING)], #[("name", 1)],
                name="user_id_index",
            ),
            IndexModel(
            [("creation_time", ASCENDING)],
                name ="creation_time_index",
            ),
            IndexModel(
            [("user_id.$id", ASCENDING), ("name", ASCENDING)],
                name ="unique_budget_name_per_user",
                unique=True,
            ),
        ]

from category_document import Category
Budget.update_forward_refs()