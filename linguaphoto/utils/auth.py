"""Authentication utilities for handling JWT tokens and OAuth2 password flow.

Functions:
- create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    Creates a new JWT access token with the provided data and optional expiration time.

- decode_access_token(token: str) -> Union[str, None]:
    Decodes the JWT token and returns the user ID if the token is valid, otherwise None.

OAuth2PasswordBearer:
- An instance of OAuth2PasswordBearer for token-based authentication, used as a dependency in FastAPI endpoints.
"""

from datetime import datetime, timedelta
from typing import Union

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from linguaphoto.crud.user import UserCrud

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Union[str, None]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("id")
    except jwt.PyJWTError:
        return None


oauth2_schema = OAuth2PasswordBearer(tokenUrl="token")


# Dependency to decode token and return user_id
async def get_current_user_id(token: str = Depends(oauth2_schema)) -> str:
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=422, detail="Could not validate credentials")
    return user_id


async def subscription_validate(token: str = Depends(oauth2_schema), user_crud: UserCrud = Depends()) -> bool:
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=422, detail="Could not validate credentials")
    async with user_crud:
        user = await user_crud.get_user(user_id, True)
    if user is None:
        raise HTTPException(status_code=422, detail="Could not validate credentials")
    if user.is_subscription is False:
        raise HTTPException(status_code=422, detail="You need to subscribe.")
    return True
