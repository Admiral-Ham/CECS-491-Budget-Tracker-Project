"""float to decimal conversion handled by beanie"""
from beanie import PydanticObjectId
from dns import transaction
from transaction_document import Transaction
from fastapi import FastAPI, APIRouter
from models.user_document import User
from models.budget_document import Budget


router = APIRouter()

@router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: Transaction):
    user = await User.get(transaction.user_id.ref.id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    #validate budget to user
    if transaction.budget_id is not None:
        budget = await Budget.get(transaction.budget_id.ref.id)
        if budget is None:
            raise HTTPException(status_code=404, detail="Budget not found")
        if budget.user_id.ref.id != transaction.user_id.ref.id:
            raise HTTPException(status_code=403, detail="Budget does not belong to this user")
    
    await transaction.insert()
    return transaction

@router.get("{user_id}/transactions")
async def get_user_transactions(user_id: PydanticObjectId):
    return await Transaction.find(Transaction.user_id == user_id).to_list() # use current_user.id in final stages

"""@app.delete("/transactions/{transaction_id}", response_model=Transaction)
async def delete_transaction(transaction_id: int):
    return transaction"""
