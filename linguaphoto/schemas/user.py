"""User data models for user authentication and management.

This module defines Pydantic models for handling user-related data,
including user sign-up, sign-in, and response data structures.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr


class UserSignupFragment(BaseModel):
    id: Optional[str] = None
    token: Optional[str] = None
    username: str
    email: EmailStr
    password: str


class UserSigninFragment(BaseModel):
    email: EmailStr
    password: str


class UserSigninRespondFragment(BaseModel):
    token: str
    username: str
    email: EmailStr
