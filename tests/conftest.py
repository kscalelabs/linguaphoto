"""Pytest configuration file."""

import os
from typing import Generator, Optional

import fakeredis
import pytest
from _pytest.python import Function
from fastapi.testclient import TestClient
from moto import mock_dynamodb  # Updated import
from pytest_mock.plugin import MockerFixture

os.environ["LINGUAPHOTO_ENVIRONMENT"] = "local"


def pytest_collection_modifyitems(items: list[Function]) -> None:
    items.sort(key=lambda x: x.get_closest_marker("slow") is not None)


@pytest.fixture(autouse=True)
def mock_aws() -> Generator[None, None, None]:
    env_vars = {}
    for k in (
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_ENDPOINT_URL_DYNAMODB",
        "AWS_REGION",
        "AWS_DEFAULT_REGION",
    ):
        if k in os.environ:
            env_vars[k] = os.environ[k]
            del os.environ[k]

    os.environ["AWS_ACCESS_KEY_ID"] = "test"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
    os.environ["AWS_REGION"] = "us-east-1"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

    # Using the updated mock_dynamodb fixture from moto
    with mock_dynamodb():
        yield

    # Restore original environment variables
    for k, v in env_vars.items():
        if v is not None:
            os.environ[k] = v


@pytest.fixture(autouse=True)
def mock_redis(mocker: MockerFixture) -> None:
    os.environ["LINGUAPHOTO_REDIS_HOST"] = "localhost"
    os.environ["LINGUAPHOTO_REDIS_PASSWORD"] = ""
    os.environ["LINGUAPHOTO_REDIS_PORT"] = "6379"
    os.environ["LINGUAPHOTO_REDIS_DB"] = "0"

    fake_redis = fakeredis.aioredis.FakeRedis()
    # mocker.patch("linguaphoto.crud.base.Redis", return_value=fake_redis)


@pytest.fixture()
def app_client() -> Generator[TestClient, None, None]:
    from linguaphoto.main import app

    with TestClient(app) as app_client:
        yield app_client
