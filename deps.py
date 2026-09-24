"""
deps.py — Shared FastAPI async dependencies.

  get_session       → yields an AsyncSession per request
  get_current_user  → decodes JWT, fetches User from DB, raises 401 on failure
  get_optional_user → decodes JWT if present, returns User or None (never raises 401)
"""
import os
import uuid
from typing import Annotated, AsyncGenerator, Optional
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal
from models import User

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-fallback-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

# auto_error=False allows handling missing credentials with our custom 401 error envelope
bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# DB session
# ---------------------------------------------------------------------------


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

_UNAUTH = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={
        "error": {
            "code": "UNAUTHORIZED",
            "message": "Invalid or expired token",
            "request_id": None,
        }
    },
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
    session: SessionDep,
) -> User:
    if not credentials or not credentials.credentials:
        raise _UNAUTH
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise _UNAUTH
        user_uuid = uuid.UUID(user_id)
    except (JWTError, ValueError):
        raise _UNAUTH

    user = await session.get(User, user_uuid)
    if user is None:
        raise _UNAUTH
    return user


async def get_optional_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
    session: SessionDep,
) -> Optional[User]:
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            return None
        user_uuid = uuid.UUID(user_id)
        user = await session.get(User, user_uuid)
        return user
    except Exception:
        return None


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[Optional[User], Depends(get_optional_user)]
