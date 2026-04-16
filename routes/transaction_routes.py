"""
Transaction Routes

Handles all API operations related to transactions:
- Create transaction
- List transactions for current user
- Get one transaction
- Update transaction
- Delete transaction

All routes require authentication.

Business rules:
- A transaction must belong to one user.
- A transaction may belong to zero or one budget.
- A transaction may belong to zero or one goal.
- A transaction cannot belong to both a budget and a goal at the same time.
- If a transaction has a category, it must also have a budget.
- If a transaction has a category, that category must belong to the given budget.
"""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from Auth.token_dependencies import get_current_user
from models.budget_document import Budget
from models.category_document import Category
from models.goal_document import Goal
from models.transaction_document import Transaction
from models.user_document import User
from schemas.transactions_schema import (
    TransactionCreate,
    TransactionRead,
    TransactionPatch,
)

router = APIRouter()


def _extract_link_id(link_value) -> str:
    """
    Safely extract the string ID from a Beanie Link or fallback value.
    """
    if getattr(link_value, "ref", None) is not None:
        return str(link_value.ref.id)
    return str(link_value)


def _to_decimal_if_needed(value):
    """
    Convert MongoDB Decimal128 into Python Decimal for API response schemas.
    """
    return value.to_decimal() if hasattr(value, "to_decimal") else value


@router.post("/", response_model=TransactionRead)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new transaction for the authenticated user.
    """
    if transaction.budget_id and transaction.goal_id:
        raise HTTPException(
            status_code=400,
            detail="A transaction cannot belong to both a budget and a goal",
        )

    if transaction.category_id and not transaction.budget_id:
        raise HTTPException(
            status_code=400,
            detail="A category requires a budget_id",
        )

    budget = None
    goal = None
    category = None

    if transaction.budget_id:
        budget = await Budget.get(PydanticObjectId(transaction.budget_id))
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")

        budget_user_id = _extract_link_id(budget.user_id)
        if budget_user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")

    if transaction.goal_id:
        goal = await Goal.get(PydanticObjectId(transaction.goal_id))
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

        goal_user_id = _extract_link_id(goal.user_id)
        if goal_user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")

    if transaction.category_id:
        category = await Category.get(PydanticObjectId(transaction.category_id))
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        category_budget_id = _extract_link_id(category.budget_id)

        if category_budget_id != str(transaction.budget_id):
            raise HTTPException(
                status_code=400,
                detail="Category does not belong to the provided budget",
            )

    db_transaction = Transaction(
        user_id=current_user,
        budget_id=budget if budget else None,
        goal_id=goal if goal else None,
        category_id=category if category else None,
        name=transaction.name,
        amount=transaction.amount,
    )

    await db_transaction.insert()

    return TransactionRead(
        id=str(db_transaction.id),
        user_id=str(current_user.id),
        budget_id=str(budget.id) if budget else None,
        goal_id=str(goal.id) if goal else None,
        category_id=str(category.id) if category else None,
        name=db_transaction.name,
        amount=_to_decimal_if_needed(db_transaction.amount),
        creation_time=db_transaction.creation_time,
    )


@router.get("/", response_model=list[TransactionRead])
async def list_transactions(current_user: User = Depends(get_current_user)):
    """
    Retrieve all transactions belonging to the authenticated user.
    """
    transactions = await Transaction.find({"user_id.$id": current_user.id}).to_list()

    return [
        TransactionRead(
            id=str(transaction.id),
            user_id=str(current_user.id),
            budget_id=_extract_link_id(transaction.budget_id) if transaction.budget_id else None,
            goal_id=_extract_link_id(transaction.goal_id) if transaction.goal_id else None,
            category_id=_extract_link_id(transaction.category_id) if transaction.category_id else None,
            name=transaction.name,
            amount=_to_decimal_if_needed(transaction.amount),
            creation_time=transaction.creation_time,
        )
        for transaction in transactions
    ]


@router.get("/{transaction_id}", response_model=TransactionRead)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve one transaction by ID if it belongs to the authenticated user.
    """
    transaction = await Transaction.get(PydanticObjectId(transaction_id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction_user_id = _extract_link_id(transaction.user_id)
    if transaction_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    return TransactionRead(
        id=str(transaction.id),
        user_id=transaction_user_id,
        budget_id=_extract_link_id(transaction.budget_id) if transaction.budget_id else None,
        goal_id=_extract_link_id(transaction.goal_id) if transaction.goal_id else None,
        category_id=_extract_link_id(transaction.category_id) if transaction.category_id else None,
        name=transaction.name,
        amount=_to_decimal_if_needed(transaction.amount),
        creation_time=transaction.creation_time,
    )


@router.patch("/{transaction_id}", response_model=TransactionRead)
async def patch_transaction(
    transaction_id: str,
    patch: TransactionPatch,
    current_user: User = Depends(get_current_user),
):
    """
    Partially update a transaction.
    """
    transaction = await Transaction.get(PydanticObjectId(transaction_id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction_user_id = _extract_link_id(transaction.user_id)
    if transaction_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    updates = patch.model_dump(exclude_unset=True)

    new_budget_id = updates.get(
        "budget_id",
        _extract_link_id(transaction.budget_id) if transaction.budget_id else None,
    )
    new_goal_id = updates.get(
        "goal_id",
        _extract_link_id(transaction.goal_id) if transaction.goal_id else None,
    )
    new_category_id = updates.get(
        "category_id",
        _extract_link_id(transaction.category_id) if transaction.category_id else None,
    )

    if new_budget_id and new_goal_id:
        raise HTTPException(
            status_code=400,
            detail="A transaction cannot belong to both a budget and a goal",
        )

    if new_category_id and not new_budget_id:
        raise HTTPException(
            status_code=400,
            detail="A category requires a budget_id",
        )

    budget = None
    goal = None
    category = None

    if new_budget_id:
        budget = await Budget.get(PydanticObjectId(new_budget_id))
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")

        budget_user_id = _extract_link_id(budget.user_id)
        if budget_user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")

    if new_goal_id:
        goal = await Goal.get(PydanticObjectId(new_goal_id))
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

        goal_user_id = _extract_link_id(goal.user_id)
        if goal_user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")

    if new_category_id:
        category = await Category.get(PydanticObjectId(new_category_id))
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        category_budget_id = _extract_link_id(category.budget_id)
        if category_budget_id != str(new_budget_id):
            raise HTTPException(
                status_code=400,
                detail="Category does not belong to the provided budget",
            )

    if "name" in updates:
        transaction.name = updates["name"]
    if "amount" in updates:
        transaction.amount = updates["amount"]

    transaction.budget_id = budget if new_budget_id else None
    transaction.goal_id = goal if new_goal_id else None
    transaction.category_id = category if new_category_id else None

    await transaction.save()

    return TransactionRead(
        id=str(transaction.id),
        user_id=str(current_user.id),
        budget_id=str(budget.id) if budget else None,
        goal_id=str(goal.id) if goal else None,
        category_id=str(category.id) if category else None,
        name=transaction.name,
        amount=_to_decimal_if_needed(transaction.amount),
        creation_time=transaction.creation_time,
    )


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a transaction if it belongs to the authenticated user.
    """
    transaction = await Transaction.get(PydanticObjectId(transaction_id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction_user_id = _extract_link_id(transaction.user_id)
    if transaction_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    await transaction.delete()
    return {"message": "Transaction deleted successfully"}