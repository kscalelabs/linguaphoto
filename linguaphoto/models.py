"""Models!"""

from typing import List, Self
from uuid import uuid4

from bcrypt import checkpw, gensalt, hashpw
from pydantic import BaseModel
from schemas.user import UserSignupFragment


class LinguaBaseModel(BaseModel):
    """Defines the base model for store database rows.

    Our database architecture uses a single table with a single primary key
    (the `id` field). This class provides a common interface for all models
    that are stored in the database.
    """

    id: str


class User(LinguaBaseModel):
    """User Class!

    - id (str): Unique identifier for the user, generated as a UUID.
    - username (str): Username of the user.
    - email (str): Email address of the user.
    - password_hash (str): Hashed password of the user.
    """

    username: str
    email: str
    password_hash: str

    @classmethod
    def create(cls, user: UserSignupFragment) -> Self:
        """Initializes a new User instance with a unique ID, username, email,and hashed password."""
        return cls(
            id=str(uuid4()),
            username=user.username,
            email=user.email,
            password_hash=hashpw(user.password.encode("utf-8"), gensalt()).decode("utf-8"),
        )

    def verify_password(self, password: str) -> bool:
        """Verifies the provided password against the stored password_hash.

        Returns True if the password matches, otherwise False.
        """
        return checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))


class Collection(LinguaBaseModel):
    title: str
    description: str
    images: List[str] = []
    user: str

    @classmethod
    def create(cls, title: str, description: str, user_id: str) -> Self:
        """Initializes a new User instance with a unique ID, username, email,and hashed password."""
        return cls(id=str(uuid4()), title=title, description=description, user=user_id)


class Image(LinguaBaseModel):
    is_traslated: bool = False
    transcript: str | None = None
    collection: str | None = None
    image_url: str
    audio_url: str | None = None
    user: str

    @classmethod
    def create(cls, image_url: str, user_id: str) -> Self:
        """Initializes a new User instance with a unique ID, username, email,and hashed password."""
        return cls(id=str(uuid4()), image_url=image_url, user=user_id)
