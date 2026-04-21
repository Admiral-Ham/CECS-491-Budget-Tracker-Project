from typing import Annotated, Optional
from datetime import datetime, UTC
from decimal import Decimal

from pymongo import IndexModel, ASCENDING
from pydantic import Field, field_validator, model_validator, field_serializer, BaseModel
from beanie import Document, Link, before_event, Insert, Replace, Save
from bson.decimal128 import Decimal128

from models.user_document import User
from models.budget_document import Budget
from models.category_document import Category
from models.goal_document import Goal


def utc_now():
    return datetime.now(UTC)


def extract_obj_id(value):
    """
    Safely extract an ID from either:
    - a Beanie Link object
    - a loaded Beanie document
    - a raw value

    This is needed because route logic may assign full document objects
    to Link fields before insert/save.
    """
    if value is None:
        return None

    if hasattr(value, "ref") and value.ref is not None:
        return value.ref.id

    if hasattr(value, "id"):
        return value.id

    return value


class Transaction(Document):
    user_id: Link[User]
    goal_id: Optional[Link[Goal]] = None
    budget_id: Optional[Link[Budget]] = None
    category_id: Optional[Link[Category]] = None
    name: str
    amount: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    creation_time: datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("amount", mode="before")
    @classmethod
    def convert_to_decimal(cls, v):
        """
        Convert MongoDB Decimal128 into Python Decimal before validation.
        """
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v

    @field_validator("amount", mode="after")
    @classmethod
    def convert_to_decimal_128(cls, v):
        """
        Convert Python Decimal into MongoDB Decimal128 after validation.
        """
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v

    @field_serializer("amount")
    def serialize_amount(self, v):
        """
        Convert stored numeric value into a JSON-safe string.
        """
        if isinstance(v, Decimal128):
            return str(v.to_decimal())
        return str(v)

    class TransactProjection(BaseModel):
        name: str
        amount: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
        creation_time: datetime

        @field_validator("amount", mode="before")
        @classmethod
        def convert_to_decimal(cls, v):
            if isinstance(v, Decimal128):
                return v.to_decimal()
            return v

        @field_validator("amount", mode="after")
        @classmethod
        def convert_to_decimal_128(cls, v):
            if isinstance(v, Decimal):
                return Decimal128(v)
            return v

        @field_serializer("amount")
        def serialize_amount(self, v):
            if isinstance(v, Decimal128):
                return str(v.to_decimal())
            return str(v)

    @model_validator(mode="after")
    def exclusive_relation(self):
        """
        Ensure a transaction does not belong to both a budget and a goal.
        """
        if self.budget_id is not None and self.goal_id is not None:
            raise ValueError("Transaction can link to a budget or a goal, not both")
        return self

    @before_event(Insert, Replace, Save)
    async def validate_category_matches_budget(self):
        """
        Ensure that if a transaction has a category, it also has a budget,
        and that the category belongs to the same budget.

        This validator must handle both:
        - Beanie Link objects
        - loaded document objects
        """
        if self.category_id is None:
            return

        if self.budget_id is None:
            raise ValueError("Category must have a budget.")

        category_id = extract_obj_id(self.category_id)
        budget_id = extract_obj_id(self.budget_id)

        if category_id is None:
            raise ValueError("Transaction category reference is invalid")
        if budget_id is None:
            raise ValueError("Transaction budget reference is invalid")

        category = await Category.get(category_id)

        if category is None:
            raise ValueError("Category does not exist.")

        category_budget_id = extract_obj_id(category.budget_id)

        if category_budget_id is None:
            raise ValueError("Category must belong to a budget")

        if str(category_budget_id) != str(budget_id):
            raise ValueError("Category must belong to the same budget as transaction")

    class Settings:
        name = "transactions"
        indexes = [
            IndexModel(
                [("user_id.$id", ASCENDING)],
                name="user_id_index"
            ),
            IndexModel(
                [("budget_id.$id", ASCENDING), ("category_id.$id", ASCENDING)],
                name="budget_category_index"
            ),
            IndexModel(
                [("goal_id.$id", ASCENDING)],
                name="goal_id_index"
            ),
        ]