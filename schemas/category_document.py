from pymongo import IndexModel, ASCENDING
from typing import Annotated, Optional
from pydantic import Field, field_validator
from beanie import  Document, Link
from datetime import datetime
from decimal import Decimal
from budget_document import Budget

class Category(Document):
    budget_id:      Optional[Link[Budget]] = None
    name:           str
    limit:          Annotated[Decimal, Field(decimal_places = 2)]
    spent:          Annotated[Decimal, Field(decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator(limit)
    def round_two_places(cls, v):
        return round(v,2)

    @field_validator(spent)
    def round_two_places(cls, v):
        return round(v,2)

    class Settings:
        name = "categories"
        indexes = [
            IndexModel(("budget_id", ASCENDING))
        ]