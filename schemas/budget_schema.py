from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
from datetime import date
from schemas.category_schema import Category

class Budget(BaseModel):
    id: Optional[int] = Field(default=None, alias="_id")
    user_id: int
    name: str = Field(default="Unnamed Budgt")
    total_amount: int = Field(default=0)
    categories: List[Category]


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