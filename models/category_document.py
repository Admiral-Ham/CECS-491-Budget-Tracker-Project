from pymongo import IndexModel, ASCENDING
from typing import Annotated
from pydantic import Field, field_validator,field_serializer, BaseModel
from beanie import  Document, Link
from bson.decimal128 import Decimal128
from datetime import datetime
from decimal import Decimal
from budget_document import Budget

class Category(Document):
    budget_id:      Link[Budget]
    budget_name:    str
    name:           str
    limit:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
    spent:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
    creation_time:  datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("limit", "spent", mode="after" )
    def convert_to_decimal_128(cls, v):
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v
    
    @field_validator("limit","spent", mode="before" )
    def convert_to_decimal(cls, v):
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v
    
    @field_serializer("limit","spent")
    def serialize_amount(self, v: Decimal128):
        return str(v.to_decimal())

    class CatProjection(BaseModel):
        name:           str
        budget_name:    str
        limit:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
        spent:          Annotated[Decimal, Field(max_digits=14, decimal_places = 2)]
        creation_time:  datetime
        
        @field_validator("limit", "spent", mode="after" )
        def convert_to_decimal_128(cls, v):
            if isinstance(v, Decimal):
                return Decimal128(v)
            return v

        @field_validator("limit","spent", mode="before" )
        def convert_to_decimal(cls, v):
            if isinstance(v, Decimal128):
                return v.to_decimal()
            return v
        @field_serializer("limit","spent")
        def serialize_amount(self, v):
            return str(v.to_decimal())

    class Settings:
        name = "categories"
        indexes = [
            IndexModel(
                [("budget_id.$id", ASCENDING)],
                name = "Budget"
            ),
        
        ]


Category.update_forward_refs()