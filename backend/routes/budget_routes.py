"""
Budget Routes

Handles all API operations related to budgets:
- Create budget
- List budgets for current user
- Update budget
- (Optional: delete / get single budget)

All routes require authentication.
"""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from Auth.token_dependencies import get_current_user
from models.budget_document import Budget
from models.user_document import User
from schemas.budget_schema import BudgetCreate, BudgetRead, BudgetPatch

# Create router instance
router = APIRouter()


@router.post("/", response_model=BudgetRead)
async def create_budget(
    budget: BudgetCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new budget for the authenticated user.

    Args:
        budget (BudgetCreate): Request body containing budget name.
        current_user (User): Authenticated user from JWT.

    Returns:
        BudgetRead: Newly created budget.

    Raises:
        HTTPException: If budget name already exists for this user.
    """
    # Create budget document
    db_budget = Budget(
        user_id=current_user,  # link budget to user
        name=budget.name,
    )

    try:
        # Insert into MongoDB
        await db_budget.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Budget name already exists for this user",
        )

    # Return formatted response for frontend
    return BudgetRead(
        id=str(db_budget.id),
        user_id=str(current_user.id),
        name=db_budget.name,
        creation_time=db_budget.creation_time,
    )


@router.get("/", response_model=list[BudgetRead])
async def list_budgets(current_user: User = Depends(get_current_user)):
    """
    Retrieve all budgets belonging to the authenticated user.

    Args:
        current_user (User): Authenticated user.

    Returns:
        List[BudgetRead]: List of user's budgets.
    """
    # Query budgets by user_id
    budgets = await Budget.find({"user_id.$id": current_user.id}).to_list()

    # Convert documents into API response schema
    return [
        BudgetRead(
            id=str(budget.id),
            user_id=str(current_user.id),
            name=budget.name,
            creation_time=budget.creation_time,
        )
        for budget in budgets
    ]


@router.patch("/{budget_id}", response_model=BudgetRead)
async def patch_budget(
    budget_id: str,
    patch: BudgetPatch,
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing budget (partial update).

    Args:
        budget_id (str): ID of the budget to update.
        patch (BudgetPatch): Fields to update (e.g., name).
        current_user (User): Authenticated user.

    Returns:
        BudgetRead: Updated budget.

    Raises:
        HTTPException:
            - 404 if budget not found
            - 403 if user does not own the budget
            - 409 if duplicate budget name
    """
    # Retrieve budget by ID
    budget = await Budget.get(PydanticObjectId(budget_id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Extract actual user_id from Link
    budget_user_id = (
        str(budget.user_id.ref.id)
        if getattr(budget.user_id, "ref", None)
        else str(budget.user_id)
    )

    # Ensure user owns this budget
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Extract only provided fields (partial update)
    updates = patch.model_dump(exclude_unset=True)

    # Apply updates dynamically
    for key, value in updates.items():
        setattr(budget, key, value)

    try:
        await budget.save()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Budget name already exists for this user",
        )

    return BudgetRead(
        id=str(budget.id),
        user_id=budget_user_id,
        name=budget.name,
        creation_time=budget.creation_time,
    )


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a budget.

    Args:
        budget_id (str): Budget ID.
        current_user (User): Authenticated user.

    Returns:
        dict: Success message.

    Raises:
        HTTPException:
            - 404 if not found
            - 403 if unauthorized
    """
    budget = await Budget.get(PydanticObjectId(budget_id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget_user_id = (
        str(budget.user_id.ref.id)
        if getattr(budget.user_id, "ref", None)
        else str(budget.user_id)
    )

    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    await budget.delete()

    return {"message": "Budget deleted successfully"}