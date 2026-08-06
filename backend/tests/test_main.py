from fastapi.testclient import TestClient

from main import app


def test_health_returns_200():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_auth_register_is_reachable():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register", json={"email": "a@b.com", "password": "secret"}
        )
        assert response.status_code != 404


def test_auth_login_is_reachable():
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": "a@b.com", "password": "secret"})
        assert response.status_code != 404


def test_wardrobe_items_list_is_reachable():
    with TestClient(app) as client:
        response = client.get("/api/wardrobe/items")
        assert response.status_code != 404


def test_outfits_list_is_reachable():
    with TestClient(app) as client:
        response = client.get("/api/outfits")
        assert response.status_code != 404
