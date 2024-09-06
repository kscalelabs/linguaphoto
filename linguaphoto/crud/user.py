"""Defines CRUD interface for user API."""

from typing import List

from crud.base import BaseCrud
from models import User
from schemas.user import UserSigninFragment, UserSignupFragment


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

    async def verify_user_by_email(self, user: UserSigninFragment) -> bool:
        users: List[User] = await self._get_items_from_secondary_index("email", user.email, User)
        # Access the first user in the list and verify the password
        if users:
            user_instance = users[0]
            return user_instance.verify_password(user.password)
        else:
            raise ValueError
