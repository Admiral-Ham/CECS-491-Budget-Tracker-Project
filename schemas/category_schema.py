from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
#from datetime import date

class Category(BaseModel):
    #id: Optional[str] = Field(default=None, alias="_id")
    #user_id: str 
    name: str
    limit: float = Field(default= 0.0)
    spent: float = Field(default= 0.0)

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    def validate_category(doc: dict):
        try: 
            user = Category.model_validate(doc)
            return True, []
        except ValidationError as e:
            return False, [str(e)]