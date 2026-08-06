import logging
import time
from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import Settings
from database import get_db
from models import User
from schemas import TokenResponse, UserCreate

logger = logging.getLogger("auth")

router = APIRouter()

pwd_context: CryptContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_RATE_LIMIT_WINDOW: float = 60.0
_RATE_LIMIT_MAX: int = 10


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    cutoff = now - _RATE_LIMIT_WINDOW
    entries = _rate_limit_store[client_ip]
    entries[:] = [t for t in entries if t > cutoff]
    if len(entries) >= _RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many requests")
    entries.append(now)


def _resolve_jwt_secret() -> str:
    secret = Settings().jwt_secret
    if not secret:
        raise HTTPException(status_code=503, detail="JWT signing secret not configured")
    return secret


def _create_token(user_id: int) -> str:
    secret = _resolve_jwt_secret()
    expire = datetime.now(UTC) + timedelta(hours=24)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, secret, algorithm="HS256")


def _validate_email_password(email: str, password: str) -> tuple[str, str]:
    normalized = (email or "").strip().lower()
    if not normalized or "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=422, detail="Invalid email format")
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    return normalized, password


@router.post("/api/auth/register", response_model=TokenResponse, status_code=201)
async def register(
    body: UserCreate, request: Request, db: Session = Depends(get_db)
) -> dict[str, str]:
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    email, password = _validate_email_password(body.email, body.password)

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = pwd_context.hash(password)
    user = User(email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info("User registered (id=%d)", user.id)

    token = _create_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/api/auth/login", response_model=TokenResponse)
async def login(
    body: UserCreate, request: Request, db: Session = Depends(get_db)
) -> dict[str, str]:
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    email = (body.email or "").strip().lower()
    password = body.password or ""

    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    logger.info("User logged in (id=%d)", user.id)

    token = _create_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    secret = _resolve_jwt_secret()
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header[len("Bearer ") :]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id_int).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
