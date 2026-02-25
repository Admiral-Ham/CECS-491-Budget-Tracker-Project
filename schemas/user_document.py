from typing import Optional

import pymongo
from pydantic import BaseModel, EmailStr
from beanie import  Document, Indexed
from datetime import datetime

class User(Document):
    name: str
    email: EmailStr
    password_hash: str
    creation_time: datetime

    class Settings:
        