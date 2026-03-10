"""budget and category"""
from fastapi import FastAPI, HTTPException
from budget_document import Budget


router = FastAPI(prefix="/budget") # GET /budgets

"""response model function for list of budgetprojection objects
- validates returned data
- filters extra fields
- consistent API output"""

@router.get("", response_model=list[Budget.BudgetProjection]) # response model returns shape of projection objects for frontend
async def list_budgets(user=Depends(get_current_user)):
    return await (
        Budget.find(Budget.user_id == user.id)
        .project(Budget.BudgetProjection)
        .to_list()
    )
@router.patch("/budgets/{budget_id}", response_model=Budget.BudgetProjection)
async def patch_budget(
    budget_id: user_id,
    patch: BudgetPatch,
    user=Depends(get_current_user))

    updates = patch.model_dump(exclude_unset=True)

    budget = await Budget.find_one(Budget.user_id == budget_id, Budget.user_id == user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    for k, v in updates.items():
        setattr(budget, k, v)
    await budget.save()
    # only needs projection for frontend
    return Budget.BudgetProjection.model_validate(budget)

#@app.get("/")
#async def

