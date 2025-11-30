from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
from datetime import datetime
from schemas.category_schema import Category
from datetime import datetime

class Budget(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: int
    name: str = Field(default="Unnamed Budget")
    total_amount: int = Field(default=0)
    categories: List[Category]
    created_on: datetime


    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    def validate_budget(doc: dict):
        try: 
            user = Budget.model_validate(doc)
            return True, []
        except ValidationError as e:
            return False, [str(e)]