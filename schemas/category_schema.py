#from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ValidationError


class CategoryCreate(BaseModel): # for POST RESPONSE
    budget_id: str #Optional[str] = Field(default=None, alias="_id")
    #user_id: str
    budget_name: str
    name: str
    limit: Decimal = Field(max_digits=14, decimal_places=2) #float = Field(default= 0.0)
    spent: Decimal = Field(default=Decimal("0.00"), max_digits=14, decimal_places=2) #float = Field(default= 0.0)

    model_config = {"extra": "forbid"}

class CategoryRead(BaseModel): # for GET API RESPONSE
    id: str
    budget_id: str
    budget_name: str
    name: str
    limit: Decimal = Field(max_digits=14, decimal_places=2)
    spent: Decimal = Field(max_digits=14, decimal_places=2)
    creation_time: datetime

    model_config = {
        "from_attributes": True
    }

class CategoryUpdate(BaseModel): # for PUT/PATCH RESPONSE
    budget_name: str | None = None
    name: str | None = None
    limit : Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    spent : Decimal | None = Field(default=None, max_digits=14, decimal_places=2)

    model_config = {
        "extra": "forbid"
    }


    def validate_category(doc: dict):
        try: 
            user = Category.model_validate(doc)
            return True, []
        except ValidationError as e:
            return False, [str(e)]