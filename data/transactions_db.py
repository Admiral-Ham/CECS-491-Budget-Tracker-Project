from schemas.transactions_schema import Transaction
from data.db import db
from datetime import datetime
from pydantic import ValidationError
from utils.object_ID_helper import str_to_object_id
db.userinfo

class TransactionsModel():
    
    @staticmethod
    def add_transaction(user_id: str, category_name: str, amount: float, note: str):
        transaction_doc = {
        "category_name": category_name,
        "amount": amount,        
        "note": note,
        "date": datetime.utcnow()
        }
        user_oid = str_to_object_id(user_id)        
        try:
            valid_transaction = Transaction.model_validate(transaction_doc)
            valid_transaction = valid_transaction.model_dump(by_alias=True, exclude_none=True)
            return db.userinfo.update_one({"_id": user_oid}, {"$push": {"transactions": valid_transaction}})
        except ValidationError as e:
            print("Validation error: ", e)

    @staticmethod
    def delete_transaction():
        pass