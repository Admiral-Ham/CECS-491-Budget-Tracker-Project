"""budget and category"""
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from Auth.token_dependencies import get_current_user
from models.budget_document import Budget
from models.user_document import User
from schemas.budget_schema import BudgetCreate, BudgetRead, BudgetPatch

router = APIRouter

"""response model function for list of budgetprojection objects
- validates returned data
- filters extra fields
- consistent API output"""

@router.post("/", response_model=BudgetRead)
async def create_budget(
        budget: BudgetCreate,
        current_user: User = Depends(get_current_user),
):
    db_budget = Budget(
        user_id=current_user,
        name=budget.name,
    )
    try:
        await db_budget.insert()
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Budget already exists")

    return BudgetRead(
        id=str(db.budget.id),
        user_id=str(current_user.id),
        name=db_budget.name,
        creation_time=db_budget.creation_time,
    )
@router.get("", response_model=list[BudgetRead]) # response model returns shape of projection objects for frontend
async def list_budgets(current_user: User = Depends(get_current_user)):
    budgets = await Budget.find(Budget.user_id == current_user.id).to_list()

    return [
        BudgetRead(
            id=str(budget.id),
            user_id=str(current_user.id),
            name=budget.name,
            creation_time=budget.creation_time,
        )
        for budget in budgets
    ]


# indexes the first collection in ascending order
@router.patch("/budgets/{budget_id}", response_model=Budget.BudgetProjection)
async def patch_budget(
    budget_id: user_id,
    patch: BudgetPatch,
    user=Depends(get_current_user))

    updates = patch.model_dump(exclude_unset=True) # this will help for making partial updates

    budget = await Budget.find_one(Budget.user_id == budget_id, Budget.user_id == user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    for k, v in updates.items():
        setattr(budget, k, v)
    await budget.save()
    # only needs projection for frontend
    return Budget.BudgetProjection.model_validate(budget)


