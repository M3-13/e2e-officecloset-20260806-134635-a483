from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from models import User

router = APIRouter()


@router.post("/api/auth/register")
async def register():
    raise HTTPException(status_code=501, detail="auth #9 implements this")


@router.post("/api/auth/login")
async def login():
    raise HTTPException(status_code=501, detail="auth #9 implements this")


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    raise HTTPException(status_code=401, detail="Not authenticated")
