"""
Category Routes

Handles all API operations related to categories:
- Create category
- List categories by budget
- Get one category
- Update category
- Delete category

All routes require authentication.
A category must belong to a budget owned by the authenticated user.
"""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from Auth.token_dependencies import get_current_user
from models.budget_document import Budget
from models.category_document import Category
from models.user_document import User
from schemas.category_schema import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()


def to_decimal_if_needed(value):
    """
    Convert MongoDB Decimal128 values into Python Decimal for API response schemas.

    CategoryRead expects Decimal-compatible values, not Decimal128.
    """
    return value.to_decimal() if hasattr(value, "to_decimal") else value


def extract_link_id(link_value) -> str:
    """
    Safely extract the string ID from a Beanie Link or fallback value.
    """
    if getattr(link_value, "ref", None) is not None:
        return str(link_value.ref.id)
    return str(link_value)


@router.post("/", response_model=CategoryRead)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new category under a budget owned by the authenticated user.

    Args:
        category (CategoryCreate): Request body containing budget_id, budget_name,
            category name, limit, and spent.
        current_user (User): Authenticated user from JWT.

    Returns:
        CategoryRead: Newly created category.

    Raises:
        HTTPException:
            - 404 if budget does not exist
            - 403 if budget does not belong to current user
    """
    budget = await Budget.get(PydanticObjectId(category.budget_id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget_user_id = extract_link_id(budget.user_id)
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    db_category = Category(
        budget_id=budget,
        budget_name=category.budget_name,
        name=category.name,
        limit=category.limit,
        spent=category.spent,
    )

    await db_category.insert()

    return CategoryRead(
        id=str(db_category.id),
        budget_id=str(budget.id),
        budget_name=db_category.budget_name,
        name=db_category.name,
        limit=to_decimal_if_needed(db_category.limit),
        spent=to_decimal_if_needed(db_category.spent),
        creation_time=db_category.creation_time,
    )


@router.get("/by-budget/{budget_id}", response_model=list[CategoryRead])
async def list_categories_by_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all categories for a specific budget owned by the authenticated user.

    Args:
        budget_id (str): Budget ID.
        current_user (User): Authenticated user.

    Returns:
        list[CategoryRead]: All categories under the specified budget.

    Raises:
        HTTPException:
            - 404 if budget does not exist
            - 403 if the budget does not belong to the current user
    """
    budget = await Budget.get(PydanticObjectId(budget_id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget_user_id = extract_link_id(budget.user_id)
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    categories = await Category.find({"budget_id.$id": budget.id}).to_list()

    return [
        CategoryRead(
            id=str(category.id),
            budget_id=str(budget.id),
            budget_name=category.budget_name,
            name=category.name,
            limit=to_decimal_if_needed(category.limit),
            spent=to_decimal_if_needed(category.spent),
            creation_time=category.creation_time,
        )
        for category in categories
    ]


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve one category by ID if it belongs to a budget owned by the authenticated user.

    Args:
        category_id (str): Category ID.
        current_user (User): Authenticated user.

    Returns:
        CategoryRead: Category data.

    Raises:
        HTTPException:
            - 404 if category does not exist
            - 403 if the category's budget does not belong to the current user
    """
    category = await Category.get(PydanticObjectId(category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    budget = await Budget.get(PydanticObjectId(extract_link_id(category.budget_id)))
    if not budget:
        raise HTTPException(status_code=404, detail="Parent budget not found")

    budget_user_id = extract_link_id(budget.user_id)
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    return CategoryRead(
        id=str(category.id),
        budget_id=str(budget.id),
        budget_name=category.budget_name,
        name=category.name,
        limit=to_decimal_if_needed(category.limit),
        spent=to_decimal_if_needed(category.spent),
        creation_time=category.creation_time,
    )


@router.patch("/{category_id}", response_model=CategoryRead)
async def patch_category(
    category_id: str,
    patch: CategoryUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Partially update a category.

    Args:
        category_id (str): Category ID.
        patch (CategoryUpdate): Partial update data.
        current_user (User): Authenticated user.

    Returns:
        CategoryRead: Updated category.

    Raises:
        HTTPException:
            - 404 if category does not exist
            - 403 if not authorized
    """
    category = await Category.get(PydanticObjectId(category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    budget = await Budget.get(PydanticObjectId(extract_link_id(category.budget_id)))
    if not budget:
        raise HTTPException(status_code=404, detail="Parent budget not found")

    budget_user_id = extract_link_id(budget.user_id)
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    updates = patch.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(category, key, value)

    await category.save()

    return CategoryRead(
        id=str(category.id),
        budget_id=str(budget.id),
        budget_name=category.budget_name,
        name=category.name,
        limit=to_decimal_if_needed(category.limit),
        spent=to_decimal_if_needed(category.spent),
        creation_time=category.creation_time,
    )


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a category if it belongs to a budget owned by the authenticated user.

    Args:
        category_id (str): Category ID.
        current_user (User): Authenticated user.

    Returns:
        dict: Success message.

    Raises:
        HTTPException:
            - 404 if category does not exist
            - 403 if not authorized
    """
    category = await Category.get(PydanticObjectId(category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    budget = await Budget.get(PydanticObjectId(extract_link_id(category.budget_id)))
    if not budget:
        raise HTTPException(status_code=404, detail="Parent budget not found")

    budget_user_id = extract_link_id(budget.user_id)
    if budget_user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    await category.delete()
    return {"message": "Category deleted successfully"}