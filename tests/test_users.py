"""Runs tests on the user APIs."""

import asyncio

from fastapi.testclient import TestClient

from linguaphoto.db import create_tables
from linguaphoto.settings import settings


def test_user_auth_functions(app_client: TestClient) -> None:
    asyncio.run(create_tables())

    assert (test_user := settings.user.test_user) is not None

    # Attempts to log in before creating the user.
    response = app_client.post("/users/google", json={"token": test_user.google_token})
    assert response.status_code == 200, response.json()
    api_key = response.json()["api_key"]

    # Checks that without the API key we get a 401 response.
    response = app_client.get("/users/me")
    assert response.status_code == 401, response.json()
    assert response.json()["detail"] == "Not authenticated"

    # Checks that with the API key we get a 200 response.
    response = app_client.get("/users/me", headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 200, response.json()
    assert response.json()["email"] == test_user.email

    # Checks that we can't log the user out without the API key.
    response = app_client.delete("/users/logout")
    assert response.status_code == 401, response.json()

    # Log the user out, which deletes the API key.
    response = app_client.delete("/users/logout", headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 200, response.json()
    assert response.json() is True

    # Checks that we can no longer use that API key to get the user's info.
    response = app_client.get("/users/me", headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 404, response.json()
    assert response.json()["detail"] == "User not found"

    # Log the user back in, getting new API key.
    response = app_client.post("/users/google", json={"token": test_user.google_token})
    assert response.status_code == 200, response.json()
    api_key = response.json()["api_key"]

    # Delete the user using the new API key.
    response = app_client.delete("/users/me", headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 200, response.json()
    assert response.json() is True

    # Tries deleting the user again, which should fail.
    response = app_client.delete("/users/me", headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 404, response.json()
    assert response.json()["detail"] == "User not found"
