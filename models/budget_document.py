from datetime import datetime, UTC
from beanie import Document, Link, BackLink
from pydantic import Field, BaseModel
from pymongo import IndexModel, ASCENDING

from models.user_document import User


def utc_now():
    return datetime.now(UTC)


class Budget(Document):
    user_id: Link[User]
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

    class Settings:
        name = "budgets"
        indexes = [
            IndexModel(
                [("user_id.$id", ASCENDING)],
                name="user_id_index",
            ),
            IndexModel(
                [("creation_time", ASCENDING)],
                name="creation_time_index",
            ),
            IndexModel(
                [("user_id.$id", ASCENDING), ("name", ASCENDING)],
                name="unique_budget_name_per_user",
                unique=True,
            ),
        ]

from models.category_document import Category
Budget.model_rebuild()
