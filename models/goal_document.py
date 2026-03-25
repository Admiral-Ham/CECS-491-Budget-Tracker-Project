# Standard Library
from typing import Annotated
from datetime import datetime
from decimal import Decimal

# Modules
from pymongo import IndexModel, ASCENDING
from pydantic import Field, field_validator, field_serializer, BaseModel
from beanie import  Document, Link, BackLink
from bson.decimal128 import Decimal128
from transaction_document import Transaction
# Local  App
from user_document import User

class Goal(Document):
    user_id:        Link[User] # Stores user_id
    transactions:   BackLink[Transaction]
    name:           str
    amount:         Annotated[Decimal, Field(decimal_places = 2)]
    saved:          Annotated[Decimal, Field(decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("amount","saved")
    def round_two_places(cls, v):
        return round(v,2)

    @field_validator("amount","saved", mode="after" )
    def convert_to_decimal_128(cls, v):
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v
    
    @field_validator("amount", "saved", mode="before" )
    def convert_to_decimal(cls, v):
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v
    
    @field_serializer("amount", "saved")
    def serialize_amount(self, v):
        return str(v.to_decimal())

    class GoalProjection(BaseModel):
        name:           str
        amount:         Annotated[Decimal, Field(decimal_places = 2)]
        saved:          Annotated[Decimal, Field(decimal_places = 2)]
        creation_time:  datetime

        @field_validator("amount","saved", mode="after" )
        def convert_to_decimal_128(cls, v):
            if isinstance(v, Decimal):
                return Decimal128(v)
            return v
        
        @field_validator("amount", "saved", mode="before" )
        def convert_to_decimal(cls, v):
            if isinstance(v, Decimal128):
                return v.to_decimal()
            return v
        
        @field_serializer("amount", "saved")
        def serialize_amount(self, v):
            return str(v.to_decimal())

    class Settings:
        name = "goals"
        indexes = [
            IndexModel(
                [("user_id.$id", 1)],
                name = "user"
            )
        ]
