from typing import Annotated
from datetime import datetime, UTC
from decimal import Decimal, ROUND_HALF_UP

from pymongo import IndexModel, ASCENDING
from pydantic import Field, field_validator, field_serializer, BaseModel
from beanie import Document, Link, BackLink
from bson.decimal128 import Decimal128

from models.user_document import User


def utc_now():
    return datetime.now(UTC)


class Goal(Document):
    user_id: Link[User]
    transactions: BackLink["Transaction"] = Field(original_field="goal_id")
    name: str
    amount: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    saved: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    creation_time: datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    @field_validator("amount", "saved")
    @classmethod
    def round_two_places(cls, v):
        if isinstance(v, Decimal):
            return v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return v

    @field_validator("amount", "saved", mode="before")
    @classmethod
    def convert_to_decimal(cls, v):
        if isinstance(v, Decimal128):
            return v.to_decimal()
        return v

    @field_validator("amount", "saved", mode="after")
    @classmethod
    def convert_to_decimal_128(cls, v):
        if isinstance(v, Decimal):
            return Decimal128(v)
        return v

    @field_serializer("amount", "saved")
    def serialize_amount(self, v):
        if isinstance(v, Decimal128):
            return str(v.to_decimal())
        return str(v)

    class GoalProjection(BaseModel):
        name: str
        amount: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
        saved: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
        creation_time: datetime

        @field_validator("amount", "saved", mode="before")
        @classmethod
        def convert_to_decimal(cls, v):
            if isinstance(v, Decimal128):
                return v.to_decimal()
            return v

        @field_validator("amount", "saved", mode="after")
        @classmethod
        def convert_to_decimal_128(cls, v):
            if isinstance(v, Decimal):
                return Decimal128(v)
            return v

        @field_serializer("amount", "saved")
        def serialize_amount(self, v):
            if isinstance(v, Decimal128):
                return str(v.to_decimal())
            return str(v)

    class Settings:
        name = "goals"
        indexes = [
            IndexModel(
                [("user_id.$id", ASCENDING)],
                name="user_id_index"
            )
        ]