"""Defines CRUD interface for user API."""

import random
import string
from typing import List

from linguaphoto.crud.base import BaseCrud
from linguaphoto.models import User
from linguaphoto.schemas.user import UserSigninFragment, UserSignupFragment


def generate_api_key() -> str:
    # Generate a random API key (example: sk-abc123def456)
    prefix = "lingua-sk-"
    key = "".join(random.choices(string.ascii_lowercase + string.digits, k=16))
    return f"{prefix}{key}"


class UserCrud(BaseCrud):
    async def create_user_from_email(self, user: UserSignupFragment) -> User | None:
        duplicated_user = await self._get_items_from_secondary_index("email", user.email, User)
        if duplicated_user:
            return None
        new_user = User.create(user)
        await self._add_item(new_user, unique_fields=["email"])
        return new_user

    async def get_user(self, id: str, throw_if_missing: bool = False) -> User | None:
        return await self._get_item(id, User, throw_if_missing=throw_if_missing)

    async def get_user_by_email(self, email: str) -> User | None:
        res = await self._get_items_from_secondary_index("email", email, User)
        return res[0]

    async def get_user_by_api_key(self, api_key: str) -> User | None:
        res = await self._list_items(
            item_class=User,
            filter_expression="#api_key=:api_key",
            expression_attribute_names={"#api_key": "api_key"},
            expression_attribute_values={":api_key": api_key},
        )
        if res:
            return res[0]
        return None

    async def verify_user_by_email(self, user: UserSigninFragment) -> bool:
        users: List[User] = await self._get_items_from_secondary_index("email", user.email, User)
        # Access the first user in the list and verify the password
        if users:
            user_instance = users[0]
            return user_instance.verify_password(user.password)
        else:
            raise ValueError

    async def update_user(self, id: str, data: dict) -> None:
        await self._update_item(id, User, data)

    async def generate_api_key(self, id: str) -> str:
        new_key = generate_api_key()
        await self._update_item(id, User, {"api_key": new_key})
        return new_key
