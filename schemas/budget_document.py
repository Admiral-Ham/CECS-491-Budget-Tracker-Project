from pymongo import IndexModel, ASCENDING
from pydantic import Field, BaseModel
from beanie import  Document, Link, BackLink
from datetime import datetime
from user_document import User

class Budget(Document):
    user_id:        Link[User] # Store user_id
    categories:     BackLink["Category"] = Field(original_field="budget_id")
    name:           str
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    class BudgetProjection(BaseModel):
        name: str
        creation_time:  datetime

    """Budget Patch basemodel allows a user to edit budget names up to 100 names."""
    class BudgetPatch(BaseModel): # multiple budget edits model
        name: str | None = Field(default=None, min_length=1, max_length=100)
        model_config= {"extra": "forbid"}

        """Budget Patch basemodel allows a user to edit budget names up to 100 names."""
    class BudgetPatch(BaseModel): # multiple budget edits model
        name: str | None = Field(default=None, min_length=1, max_length=100)
        model_config= {"extra": "forbid"}

    class Settings:
        name = "budgets"
        indexes = [
            IndexModel(
                [("creation_time", ASCENDING)],
                name = "creation_time",
            ),
            IndexModel(
                [("user_id.$id", 1)],
                name = "user"
            )
        ]

from category_document import Category
Budget.update_forward_refs()
