# routes/user_create.py

from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

from models.user_document import User
from schemas.users_schema import UserCreate, UserRead, UserLogin

router = APIRouter() #instantiates the router for frontend

def verify_password(password: str, password_hash: str) -> bool:
    return f"hashed:{password}" == password_hash # temporary testing for login


def hashed(password: str) -> str:
    return f"hashed:{password}" #temporary for testing only

"""finds user by email, and compares password to stored hash"""
@router.post("/login")
async def user_login(data: UserLogin):
    user = await User.find_one(User.email == data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful"}
"""Login JSON response needs access token and token type in JWT"""

@router.post("/register", response_model=UserRead) #response_model_exclude={"password_hash"})
async def register_user(user: UserCreate):
    user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed(user.password_hash)
    )

    try:
        await user.insert()
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="User name or email already exists")

    return user

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: PydanticObjectId):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


"""Expected JSON response: beanie inserts user to MongoDB
FastAPI returns as User fields"""