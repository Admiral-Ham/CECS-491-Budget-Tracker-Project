from pymongo import IndexModel, ASCENDING
from typing import Annotated, Optional
from pydantic import Field, field_validator,field_serializer
from beanie import  Document, Link
from bson.decimal128 import Decimal128
from datetime import datetime
from decimal import Decimal
from budget_document import Budget

class Category(Document):
    budget_id:      Optional[Link[Budget]] = None
    name:           str
    limit:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
    spent:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("limt", mode="after" )
    def convert_to_decimal_128(cls, v:Decimal):
        return Decimal128(v)
    
    @field_validator("spent", mode="after" )
    def convert_to_decimal_128(cls, v:Decimal):
        return Decimal128(v)
    
    @field_serializer("limit")
    def serialize_amount(cls, v: Decimal128):
        return str(v.to_decimal())
    
    @field_serializer("spent")
    def serialize_amount(cls, v: Decimal128):
        return str(v.to_decimal())

    class Settings:
        name = "categories"
        indexes = [
            IndexModel([("budget_id", ASCENDING)])
        ]