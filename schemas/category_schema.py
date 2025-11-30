from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
#from datetime import date

class Category(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: int 
    name: str
    type: str = Field(default="Need")

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