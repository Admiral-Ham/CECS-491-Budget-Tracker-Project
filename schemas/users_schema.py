from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel, Field, ValidationError, EmailStr
from schemas.transactions_schema import Transaction
#from beanie import Document, Indexed


class User(BaseModel):
    id: Optional[int] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password_hash: str
    creation_time: str
    transactions: List[Transaction]

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
    
    