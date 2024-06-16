"""Defines base tools for interacting with the database."""

import asyncio
import logging
from typing import AsyncGenerator, Self

import argparse
from linguaphoto.crud.base import BaseCrud
from linguaphoto.crud.images import ImagesCrud
from linguaphoto.crud.users import UserCrud


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
                    ("usernameIndex", "username", "S", "HASH"),
                ],
                deletion_protection=deletion_protection,
            ),
            crud._create_dynamodb_table(
                name="Images",
                keys=[
                    ("image_id", "S", "HASH"),
                ],
            ),
        )


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
