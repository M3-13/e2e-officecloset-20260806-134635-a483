import os

import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from jose import jwt

from auth import get_current_user
from database import SessionLocal
from main import app


@pytest.fixture(autouse=True)
def _set_jwt_secret() -> None:
    os.environ["JWT_SECRET"] = "test-jwt-secret-for-testing-only"


def test_register_returns_201_with_token() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register",
            json={"email": "new@example.com", "password": "securepass123"},
        )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    payload = jwt.decode(
        data["access_token"], "test-jwt-secret-for-testing-only", algorithms=["HS256"]
    )
    assert payload["sub"] == "1"


def test_register_duplicate_email_returns_409() -> None:
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "dup@example.com", "password": "securepass123"},
        )
        response = client.post(
            "/api/auth/register",
            json={"email": "dup@example.com", "password": "securepass123"},
        )
    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


def test_register_short_password_returns_422() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register",
            json={"email": "short@example.com", "password": "ab"},
        )
    assert response.status_code == 422
    assert "at least 8 characters" in response.json()["detail"]


def test_register_invalid_email_returns_422() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register",
            json={"email": "not-an-email", "password": "securepass123"},
        )
    assert response.status_code == 422
    assert "Invalid email" in response.json()["detail"]


def test_register_missing_fields_returns_422() -> None:
    with TestClient(app) as client:
        response = client.post("/api/auth/register", json={})
    assert response.status_code == 422


def test_login_returns_200_with_token() -> None:
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "login@example.com", "password": "securepass123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "securepass123"},
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_returns_401() -> None:
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "wrongpw@example.com", "password": "securepass123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "wrongpw@example.com", "password": "wrongpassword"},
        )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_nonexistent_email_returns_401() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"email": "noone@example.com", "password": "securepass123"},
        )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_rate_limit_register_returns_429() -> None:
    with TestClient(app) as client:
        for i in range(10):
            resp = client.post(
                "/api/auth/register",
                json={"email": f"rlreg{i}@example.com", "password": "securepass123"},
            )
            assert resp.status_code == 201
        response = client.post(
            "/api/auth/register",
            json={"email": "rlreg11@example.com", "password": "securepass123"},
        )
    assert response.status_code == 429
    assert response.json()["detail"] == "Too many requests"


def test_rate_limit_login_returns_429() -> None:
    with TestClient(app) as client:
        for _ in range(10):
            client.post(
                "/api/auth/login",
                json={"email": "doesnotmatter@example.com", "password": "securepass123"},
            )
        response = client.post(
            "/api/auth/login",
            json={"email": "doesnotmatter@example.com", "password": "securepass123"},
        )
    assert response.status_code == 429


def test_rate_limit_applies_per_endpoint() -> None:
    with TestClient(app) as client:
        for i in range(10):
            resp = client.post(
                "/api/auth/register",
                json={"email": f"rlsplit{i}@example.com", "password": "securepass123"},
            )
            assert resp.status_code == 201
        resp = client.post(
            "/api/auth/login",
            json={"email": "any@example.com", "password": "securepass123"},
        )
        assert resp.status_code == 200


def test_get_current_user_valid_token() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={"email": "gcuser@example.com", "password": "securepass123"},
        )
        token = resp.json()["access_token"]

    db = SessionLocal()
    try:
        scope: dict = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"authorization", f"Bearer {token}".encode())],
            "query_string": b"",
        }
        request = Request(scope)
        import asyncio

        user = asyncio.run(get_current_user(request, db))
        assert user.email == "gcuser@example.com"
    finally:
        db.close()


def test_get_current_user_no_token_returns_401() -> None:
    db = SessionLocal()
    try:
        scope: dict = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
            "query_string": b"",
        }
        request = Request(scope)
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            import asyncio

            asyncio.run(get_current_user(request, db))
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Not authenticated"
    finally:
        db.close()


def test_get_current_user_invalid_token_returns_401() -> None:
    db = SessionLocal()
    try:
        scope: dict = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"authorization", b"Bearer this.is.not.a.valid.token")],
            "query_string": b"",
        }
        request = Request(scope)
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            import asyncio

            asyncio.run(get_current_user(request, db))
        assert exc_info.value.status_code == 401
        assert "Invalid or expired" in exc_info.value.detail
    finally:
        db.close()


def test_get_current_user_missing_sub_returns_401() -> None:
    secret = os.environ["JWT_SECRET"]
    token = jwt.encode({"exp": 9999999999}, secret, algorithm="HS256")
    db = SessionLocal()
    try:
        scope: dict = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"authorization", f"Bearer {token}".encode())],
            "query_string": b"",
        }
        request = Request(scope)
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            import asyncio

            asyncio.run(get_current_user(request, db))
        assert exc_info.value.status_code == 401
        assert "Invalid token payload" in exc_info.value.detail
    finally:
        db.close()


def test_get_current_user_user_not_found_returns_401() -> None:
    secret = os.environ["JWT_SECRET"]
    token = jwt.encode({"sub": "99999", "exp": 9999999999}, secret, algorithm="HS256")
    db = SessionLocal()
    try:
        scope: dict = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"authorization", f"Bearer {token}".encode())],
            "query_string": b"",
        }
        request = Request(scope)
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            import asyncio

            asyncio.run(get_current_user(request, db))
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User not found"
    finally:
        db.close()


def test_password_not_in_response_and_is_hashed_in_db() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={"email": "nopw@example.com", "password": "securepass123"},
        )
        data = resp.json()
        assert "password" not in data
        assert "hashed_password" not in data
        assert "access_token" in data

    db = SessionLocal()
    try:
        from models import User as UserModel

        user = db.query(UserModel).filter(UserModel.email == "nopw@example.com").first()
        assert user is not None
        assert user.hashed_password != "securepass123"
        assert user.hashed_password.startswith("$2")
    finally:
        db.close()
