"""Collection API."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from linguaphoto.crud.user import UserCrud
from linguaphoto.utils.auth import get_current_user_id, subscription_validate

router = APIRouter()


class ApiKeyResponse(BaseModel):
    api_key: str


@router.get("/generate", response_model=ApiKeyResponse)
async def generate(
    user_id: str = Depends(get_current_user_id),
    user_crud: UserCrud = Depends(),
    is_subscribed: bool = Depends(subscription_validate),
) -> ApiKeyResponse:
    async with user_crud:
        new_key = await user_crud.generate_api_key(user_id)
        return ApiKeyResponse(api_key=new_key)
