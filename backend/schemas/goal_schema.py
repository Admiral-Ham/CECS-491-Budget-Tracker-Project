from typing import Annotated
from datetime import datetime, UTC
from decimal import Decimal

from pydantic import BaseModel, Field

def utc_now():
    return datetime.now(UTC)

class GoalCreate(BaseModel): # For POST Reponse
    #user_id: str
    name: str
    amount: Annotated[Decimal, Field(default=Decimal("0.00") ,max_digits=14, decimal_places=2)]
    saved: Annotated[Decimal, Field(default=Decimal("0.00") ,max_digits=14, decimal_places=2)]
    #creation_time: datetime = Field(default_factory=utc_now)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

class GoalRead(BaseModel): # For GET Reponse
    id: str
    name: str
    amount: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    saved: Annotated[Decimal, Field(max_digits=14, decimal_places=2)]
    creation_time: datetime

    model_config = {
        "from_attributes": True, "extra": "forbid"
    }

class GoalUpdate(BaseModel): #For PUT/PATCH Reponse
    name: str | None = None
    amount : Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    saved : Decimal | None = Field(default=None, max_digits=14, decimal_places=2)

    model_config = {"extra": "forbid"}