# routes/user_create.py

from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: User)
    user = User(
        name=user.name,
        email=user.email,
        password=hashed(user.password)
    )

    try:
        await user.insert()
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="User name or email already exists")

    return user

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: PydanticObjectId):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


"""Expected JSON response: beanie inserts user to MongoDB
FastAPI returns as User fields"""