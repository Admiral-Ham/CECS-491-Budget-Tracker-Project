#from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
from datetime import datetime

class Transaction(BaseModel):
    #id: Optional[str] = Field(default=None, alias="_id")
    #category_id: int = Field(default=None)
    category_name: str
    amount: float
    note: str
    date: datetime

    model_config = {
        "populate_by_name": True,
        "extra": "forbid"
    }

    def validate_transaction(doc: dict):
        try: 
            user = Transaction.model_validate(doc)
            return True, []
        except ValidationError as e:
            return False, [str(e)]