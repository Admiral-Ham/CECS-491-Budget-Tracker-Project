# routes/user_create.py
from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, HTTPException, Depends
#from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

from models.user_document import User
from schemas.users_schema import UserCreate, UserRead, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from Auth.token import hash_password, verify_password, create_access_token, create_password_reset_token

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

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await User.find_one(User.email == data.email)

    if user:
        reset_token = create_password_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_expires_at = datetime.utcnow() + timedelta(hours=1)
        await user.save()

        # For now it prints the link in backend terminal
        print(
            f"Password reset link: http://localhost:5173/reset-password?token={reset_token}"
        )
    return {
        "message": "If that email exists, a password reset link has been sent to you."
    }

@ router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    user = await User.find_one(User.password_reset_token == data.token)

    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired reset token")

    if (
        user.password_reset_expires_at is None
        or user.password_reset_expires_at < datetime.utcnow(UTC)
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password_hash = hash_password(data.new_password)
    user.password_reset_token = None
    user.password_reset_expires_at = None
    await user.save()

    return {"message": "Password reset successful."}

@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


"""Expected JSON response: beanie inserts user to MongoDB
FastAPI returns as User fields"""
