from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    budget_id: str | None = None
    goal_id: str | None = None
    category_id: str | None = None
    name: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(max_digits=14, decimal_places=2)

    model_config = {
        "extra": "forbid"
    }


class TransactionRead(BaseModel):
    id: str
    user_id: str
    budget_id: str | None = None
    goal_id: str | None = None
    category_id: str | None = None
    name: str
    amount: Decimal
    creation_time: datetime

    model_config = {
        "from_attributes": True,
        "extra": "forbid"
    }


class TransactionPatch(BaseModel):
    budget_id: str | None = None
    goal_id: str | None = None
    category_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    amount: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)

    model_config = {"extra": "forbid"}