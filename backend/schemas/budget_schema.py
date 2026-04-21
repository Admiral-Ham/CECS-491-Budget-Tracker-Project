from typing import List
from pydantic import BaseModel, Field
from datetime import datetime

class Budget(BaseModel):
    #id: Optional[str] = Field(default=None, alias="_id")
    user_id: str #Primary key
    name: str = Field(default="Unnamed Budget") #Primary Key
    total_amount: float = Field(default=0)
    categories: List[str]
    created_on: datetime

class BudgetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

class BudgetRead(BaseModel):
    id: str
    user_id: str
    name: str
    creation_time: datetime

    model_config = {"from_attributes": True}

class BudgetPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)

    model_config = {"extra": "forbid"}


    """def validate_budget(doc: dict):
        try: 
            user = Budget.model_validate(doc)
            return True, []
        except ValidationError as e:
            return False, [str(e)]"""