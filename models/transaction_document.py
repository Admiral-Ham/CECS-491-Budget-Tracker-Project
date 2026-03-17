# Standard Library
from typing import Annotated, Optional
from datetime import datetime
from decimal import Decimal

# Modules
from pymongo import IndexModel, ASCENDING
from pydantic import Field, field_validator, model_validator, field_serializer, BaseModel
from beanie import  Document, Link, before_event, Insert, Replace, Save
from bson.decimal128 import Decimal128

# Local App
from models.user_document import User
from goal_document import Goal
from models.budget_document import Budget
from models.category_document import Category


class Transaction(Document):
    user_id:        Link[User] # Stores user_id
    goal_id:        Optional[Link[Goal]] = None
    budget_id:      Optional[Link[Budget]] = None
    category_id:    Optional[Link[Category]] = None
    note:           str
    amount:         Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("amount", mode="after" )
    def convert_to_decimal_128(cls, v):
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v
    
    @field_validator("amount", mode="before" )
    def convert_to_decimal(cls, v):
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v
    
    @field_serializer("amount")
    def serialize_amount(self, v):
        return str(v.to_decimal())

    class TransactProjection(BaseModel):
        note: str
        amount:         Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
        creation_time:  datetime

        @field_validator("amount", mode="after" )
        def convert_to_decimal_128(cls, v):
            if isinstance(v, Decimal):
                return Decimal128(v)
            return v

        @field_validator("amount", mode="before" )
        def convert_to_decimal(cls, v):
            if isinstance(v, Decimal128):
                return v.to_decimal()
            return v

        @field_serializer("amount")
        def serialize_amount(self, v):
            return str(v.to_decimal())

    # This model validator ensure that the optional relations for goal and budget remain 
    # exclusive. For example the transaction can only be related to a goal or a budget
    @model_validator(mode="after")
    def exclusive_relation(self):
        if (self.budget_id is not None) and (self.goal_id is not None):
            raise ValueError("Transaction can link to a budget or a goal, not both")
        return self

    @before_event(Insert, Replace, Save)
    async def validate_category_matches_budget(self):
        """
        Validator created to ensure that a category belongs to a budget before inserting, replaceing or saving to a database.
        """
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
            IndexModel(
                [("user_id.$id", 1)],
                name = "User"
            ), 
            IndexModel(
                [("budget_id.$id", ASCENDING), ("category_id.$id", ASCENDING)],
                name = "Bud and Cat"
            ),
            IndexModel(
                [("goal_id", ASCENDING)],
                name = "Goal"
                )

        ]
