from pymongo import IndexModel, ASCENDING
from typing import Annotated, Optional
from pydantic import Field, field_validator, model_validator
from beanie import  Document, Link, before_event, Insert, Replace, Save
from datetime import datetime
from decimal import Decimal
from user_document import User
from goal_document import Goal
from budget_document import Budget
from category_document import Category

class Transaction(Document):
    user_id:        Link[User] # Stores user_id
    goal_id:        Optional[Link[Goal]] = None
    budget_id:      Optional[Link[Budget]] = None
    category_id:    Optional[Link[Category]] = None
    name:           str
    amount:         Annotated[Decimal, Field(decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator(amount)
    def round_two_places(cls, v):
        return round(v,2)

    # This model validator ensure that the optional relations for goal and budget remain 
    # 
    @model_validator(mode="after")
    def exclusive_relation(self):
        if (self.budget_id is not None) and (self.goal_id is not None):
            raise ValueError("Transaction can link to a budget or a goal, not both")
        return self

    @model_validator(mode="after")
    def exclusive_relation(self):
        if (self.budget_id is not None) and (self.goal_id is not None):
            raise ValueError("Transaction can link to a budget or a goal, not both")
        return self

    @before_event(Insert, Replace, Save)
    async def validate_category_matches_budget(self):
        if self.category_id is None:
            return
        if self.budget_id is None:
            raise ValueError("Category must have a budget.")
        
        category = await Category.get(self.category_id)

        if category is None:
            raise ValueError("Category does not exist.")
        if category.budget_id != self.budget_id:
            raise ValueError("Category must belong to the same budget")

    class Settings:
        name = "transactions"
        indexes = [
            IndexModel(("user_id", ASCENDING)), 
            IndexModel([("budget_id", ASCENDING), ("category_id", ASCENDING)]),
            IndexModel(("goal_id", ASCENDING))            
        ]
