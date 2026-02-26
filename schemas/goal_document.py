# Standard Library
from typing import Annotated
from datetime import datetime
from decimal import Decimal

# Modules
from pymongo import IndexModel, ASCENDING
from pydantic import Field, field_validator
from beanie import  Document, Link

# Local  App
from user_document import User

class Goal(Document):
    user_id: Link[User] # Stores user_id
    name: str
    amount:  Annotated[Decimal, Field(decimal_places = 2)]
    saved:  Annotated[Decimal, Field(decimal_places = 2)]
    creation_time: datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator(amount)
    def round_two_places(cls, v):
        return round(v,2)

    @field_validator(saved)
    def round_two_places(cls, v):
        return round(v,2)

    class Settings:
        name = "goals"
        indexes = [
            IndexModel(("user_id", ASCENDING))
        ]
