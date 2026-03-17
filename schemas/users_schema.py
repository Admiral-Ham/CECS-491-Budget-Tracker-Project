from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError, EmailStr

from datetime import datetime

class User(BaseModel):
    #id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr # Primary Key
    password_hash: str
    creation_time: datetime
    #transactions: List[dict] >>>this could cause issues for fastapi, will use fastapi for transactions route as a to_list() to handle separation of concerns

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }


def validate_user(doc: dict):
    try:
        user = User.model_validate(doc)
        return True, []
    except ValidationError as e:
        return False, [str(e)]