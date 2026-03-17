"""float to decimal conversion handled by beanie"""
from beanie import PydanticObjectId
from dns import transaction
from transaction_document import Transaction
from fastapi import FastAPI, APIRouter

router = APIRouter()

@router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: Transaction):
    return transaction

@router.get("{user_id}/transactions")
async def get_user_transactions(user_id: PydanticObjectId):
    return await Transaction.find(Transaction.user_id == user_id).to_list() # use current_user.id in final stages

"""@app.delete("/transactions/{transaction_id}", response_model=Transaction)
async def delete_transaction(transaction_id: int):
    return transaction"""
