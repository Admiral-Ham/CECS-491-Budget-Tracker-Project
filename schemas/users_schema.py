from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError, EmailStr
from beanie import PydanticObjectId
from datetime import datetime

"""helper function for validation"""
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
"""FastAPI request body for userinput"""

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)

    model_config = {"extra": "forbid"}

"""FastAPI request body for user output"""
class UserRead(BaseModel):
    id: PydanticObjectId
    name: str
    email: EmailStr
    creation_time: datetime

"""Login input projection"""
class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = {"extra": "forbid"}

class Token(BaseModel)
    access_token: str
    token_type : str
    
# both base models
def validate_user(doc: dict):
    try:
        user = User.model_validate(doc)
        return True, []
    except ValidationError as e:
        return False, [str(e)]
