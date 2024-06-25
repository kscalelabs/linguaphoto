"""Tests the image upload functionality of the app."""

import asyncio
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from linguaphoto.db import create_tables
from linguaphoto.settings import settings


def test_user_auth_functions(app_client: TestClient) -> None:
    asyncio.run(create_tables())

    assert (test_user := settings.user.test_user) is not None

    # Attempts to log in before creating the user.
    response = app_client.post("/users/google", json={"token": test_user.google_token})
    assert response.status_code == 200, response.json()
    api_key = response.json()["api_key"]

    # Tests uploading a file.
    img = Image.new("RGB", (320, 240), (128, 128, 128))
    fp = BytesIO()
    img.save(fp, format="JPEG")
    fp.seek(0)

    response = app_client.post(
        "/images/upload",
        files={"image": ("test_img.jpg", fp.read())},
        headers={"Authorization": f"Bearer {api_key}"},
    )
    assert response.status_code == 200, response.json()
