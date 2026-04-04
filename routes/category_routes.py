from resource import RLIMIT_CPU

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from models.category_document import Category
from schemas.category_schema import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()

@router.post("/", response_model=CategoryRead)
async def create_category(category: CategoryCreate):
    db_category = Category(
        budget_id=PydanticObjectId(category.budget_id),
        budget_name=category.budget_name,
        name=category.name,
        limit=category.limit,
        spent=category.spent,
    )

    await db_category.insert()

    return CategoryRead(
        id=str(db_category.id),
        budget_id=str(db_category.budget_id.ref.id) if getattr(db_category.budget_id, "ref", None) else category.budget_id,
        budget_name=db_category.budget_name,
        name=db_category.name,
        limit=db_category.limit,
        spent=db_category.spent,
        creation_time=db_category.creation_time,
    )

@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(category_id: str):
    category = await Category.get(PydanticObjectId(category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return CategoryRead(
        id=str(category.id),
        budget_id=str(category.budget_id.ref.id) if getattr(category.budget_id, "ref", None) else "",
        budget_name=category.budget_name,
        name=category.name,
        limit=category.limit,
        spent=category.spent,
        creation_time=category.creation_time,


    )

"""# enables partial updates for spent, limit, and name (excludes other object fields)"""
@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(category_id: str, updates: CategoryUpdate):
    category = await Category.get(PydanticObjectId(category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = updates.model_dump(exclude_unset=True)

    for field, value in update_data.items(): # parses user input data
        setattr(category, field, value)

    await category.save()

    return CategoryRead(
        id=str(category.id),
        budget_id=str(category.budget_id.ref.id) if getattr(category.budget_id, "ref", None) else "",
        budget_name=category.budget_name,
        name=category.name,
        limit=category.limit,
        spent=category.spent,
        creation_time=category.creation_time,
    )