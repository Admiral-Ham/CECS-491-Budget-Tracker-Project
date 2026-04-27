from datetime import datetime, UTC
from decimal import Decimal
from typing import Annotated

from beanie import Document, Link
from bson.decimal128 import Decimal128
from pydantic import Field, field_validator, field_serializer
from pymongo import ASCENDING, IndexModel

from models.budget_document import Budget


def utc_now():
    return datetime.now(UTC)


class Category(Document):
    budget_id: Link[Budget]
    budget_name: str
    name: str
    limit: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    spent: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    creation_time: datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("limit", "spent", mode="before")
    @classmethod
    def convert_to_decimal(cls, v):
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v

    @field_validator("limit", "spent", mode="after")
    @classmethod
    def convert_to_decimal_128(cls, v):
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v

    @field_serializer("limit", "spent")
    def serialize_amount(self, v):
        if isinstance(v, Decimal128):
            return str(v.to_decimal())
        return str(v)

    class Settings:
        name = "categories"
        indexes = [
            IndexModel(
                [("budget_id.$id", ASCENDING)],
                name="Budget"
            ),
        ]