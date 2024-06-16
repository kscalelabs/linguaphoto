"""Defines base tools for interacting with the database."""

import argparse
import asyncio
import logging
import uuid
from typing import AsyncGenerator, Self

from linguaphoto.crud.base import BaseCrud
from linguaphoto.crud.images import ImagesCrud
from linguaphoto.crud.users import UserCrud
from linguaphoto.model import User
from linguaphoto.settings import settings


class Crud(
    UserCrud,
    ImagesCrud,
    BaseCrud,
):
    """Composes the various CRUD classes into a single class."""

    @classmethod
    async def get(cls) -> AsyncGenerator[Self, None]:
        async with cls() as crud:
            yield crud


async def create_tables(crud: Crud | None = None, deletion_protection: bool = False) -> None:
    """Initializes all of the database tables.

    Args:
        crud: The top-level CRUD class.
        deletion_protection: Whether to enable deletion protection on the tables.
    """
    logging.basicConfig(level=logging.INFO)

    if crud is None:
        async with Crud() as crud:
            await create_tables(crud)

    else:
        await asyncio.gather(
            crud._create_dynamodb_table(
                name="Users",
                keys=[
                    ("user_id", "S", "HASH"),
                ],
                gsis=[
                    ("emailIndex", "email", "S", "HASH"),
                ],
                deletion_protection=deletion_protection,
            ),
            crud._create_dynamodb_table(
                name="Images",
                keys=[
                    ("image_id", "S", "HASH"),
                ],
                gsis=[
                    ("userIndex", "user_id", "S", "HASH"),
                ],
                deletion_protection=deletion_protection,
            ),
        )


async def delete_tables(crud: Crud | None = None) -> None:
    """Deletes all of the database tables.

    Args:
        crud: The top-level CRUD class.
    """
    logging.basicConfig(level=logging.INFO)

    if crud is None:
        async with Crud() as crud:
            await delete_tables(crud)

    else:
        await asyncio.gather(
            crud._delete_dynamodb_table("Users"),
            crud._delete_dynamodb_table("Images"),
        )


async def populate_with_dummy_data(crud: Crud | None = None) -> None:
    """Populates the database with dummy data.

    Args:
        crud: The top-level CRUD class.
    """
    logging.basicConfig(level=logging.INFO)

    if crud is None:
        async with Crud() as crud:
            await populate_with_dummy_data(crud)

    else:
        assert (test_user := settings.user.test_user) is not None
        await crud.add_user(user=User(user_id=str(uuid.uuid4()), email=test_user.email))


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["create", "delete", "populate"])
    args = parser.parse_args()

    async with Crud() as crud:
        match args.action:
            case "create":
                await create_tables(crud)
            case "delete":
                await delete_tables(crud)
            case "populate":
                await populate_with_dummy_data(crud)
            case _:
                raise ValueError(f"Invalid action: {args.action}")


if __name__ == "__main__":
    # python -m linguaphoto.db
    asyncio.run(create_tables())
