"""This module defines the API routes for user authentication."""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException

from linguaphoto.crud.user import UserCrud
from linguaphoto.schemas.user import (
    UserSigninFragment,
    UserSigninRespondFragment,
    UserSignupFragment,
)
from linguaphoto.utils.auth import create_access_token, decode_access_token, oauth2_schema

router = APIRouter()


@router.post("/signup", response_model=UserSigninRespondFragment | None)
async def signup(user: UserSignupFragment, user_crud: UserCrud = Depends()) -> dict | None:
    """User registration endpoint.

    This endpoint allows a new user to sign up by providing the necessary user details.
    It creates a new user entry in the database and returns the user object with an access token.
    """
    async with user_crud:
        new_user = await user_crud.create_user_from_email(user)
        if new_user is None:
            print(
                UserSigninRespondFragment(
                    token="", username=user.username, email=user.email, is_subscription=False, is_auth=False
                ).model_dump()
            )
            return UserSigninRespondFragment(
                token="", username=user.username, email=user.email, is_subscription=False, is_auth=False
            ).model_dump()
        token = create_access_token({"id": new_user.id}, timedelta(hours=24))
        res_user = new_user.model_dump()
        res_user.update({"token": token, "is_auth": True})
        return res_user


@router.post("/signin", response_model=UserSigninRespondFragment | None)
async def signin(user: UserSigninFragment, user_crud: UserCrud = Depends()) -> dict | None:
    """User login endpoint.

    This endpoint allows an existing user to sign in by verifying their credentials.
    If successful, it returns the user's details along with an access token.
    """
    async with user_crud:
        if await user_crud.verify_user_by_email(user):
            res_user = await user_crud.get_user_by_email(user.email)
            user_dict = res_user.__dict__
            token = create_access_token({"id": user_dict["id"]}, timedelta(hours=24))
            user_dict.update({"token": token, "is_auth": True})
            return user_dict
        else:
            raise HTTPException(status_code=422, detail="Could not validate credentials")


@router.get("/me", response_model=UserSigninRespondFragment | None)
async def get_me(token: str = Depends(oauth2_schema), user_crud: UserCrud = Depends()) -> dict | None:
    """Retrieve the currently authenticated user's information.

    This endpoint uses the provided token to decode and identify the user.
    It returns the user's details along with a refreshed access token.
    """
    id = decode_access_token(token)
    if id is None:
        raise HTTPException(status_code=422, detail="Could not validate credentials")
    async with user_crud:
        user = await user_crud.get_user(id, True)
        if user is None:
            raise HTTPException(status_code=422, detail="user not found")
        dict_user = user.model_dump()
        dict_user.update({"token": token, "is_auth": True})
        print(dict_user)
        return dict_user
