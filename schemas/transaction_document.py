from pymongo import IndexModel, ASCENDING
from typing import Annotated, Optional
from pydantic import Field, field_validator, model_validator
from beanie import  Document, Link
from datetime import datetime
from decimal import Decimal
from user_document import User
from goal_document import Goal
from budget_document import Budget
class Transaction(Document):
    user_id:        Link[User] # Stores user_id
    goal_id:        Optional[Link[Goal]] = None
    budget_id:      Optional[Link[Budget]] = None
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

    class Settings:
        name = "transactions"
        indexes = [
            IndexModel(("user_id", ASCENDING)), 
            IndexModel(("budget_id", ASCENDING)),
            IndexModel(("goal_id", ASCENDING))            
        ]
