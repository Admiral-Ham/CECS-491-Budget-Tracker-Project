# routes/user_create.py

from fastapi import APIRouter, HTTPException
#from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

from models.user_document import User
from schemas.users_schema import UserCreate, UserRead, UserLogin, Token
from Auth.token import hash_password, verify_password, create_access_token
from Auth.token_dependencies import get_current_user

router = APIRouter() #instantiates the router for frontend


@router.post("/register", response_model=UserRead)
async def register_user(user: UserCreate):
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
    )

    try:
        await db_user.insert()
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="User name or email already exists")

    return db_user


@router.post("/login", response_model=Token)
async def login_user(credentials: UserLogin):
    user = await User.find_one(User.email == credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


"""Expected JSON response: beanie inserts user to MongoDB
FastAPI returns as User fields"""
