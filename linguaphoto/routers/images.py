"""Defines the API endpoint for creating and deleting images."""

import logging
import uuid
from io import BytesIO
from typing import Annotated

from fastapi import APIRouter, Depends, File, Request, UploadFile, status
from fastapi.exceptions import HTTPException
from PIL import Image
from pydantic.main import BaseModel

from linguaphoto.db import Crud
from linguaphoto.routers.users import ApiKeyData, get_api_key
from linguaphoto.settings import settings

logger = logging.getLogger(__name__)

images_router = APIRouter()


class UploadImageResponse(BaseModel):
    success: bool = True


@images_router.post("/upload")
async def upload_image(
    image: Annotated[UploadFile, File(...)],
    data: Annotated[ApiKeyData, Depends(get_api_key)],
    crud: Annotated[Crud, Depends(Crud.get)],
) -> UploadImageResponse:
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
    max_bytes = settings.image.max_upload_height * settings.image.max_upload_width * 3
    if (fsize := image.size) is None or fsize >= max_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File size exceeds {max_bytes} bytes")

    # Spools the file to an in-memory PIL image.
    fp = BytesIO(image.file.read())
    fp.seek(0)
    img = Image.open(fp, formats=("PNG", "JPEG", "WEBP"))

    if img.width >= settings.image.max_upload_width:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File width exceeds {settings.image.max_upload_width} pixels",
        )
    if img.height >= settings.image.max_upload_height:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File height exceeds {settings.image.max_upload_height} pixels",
        )

    # Adds the image to the database.
    image_id = uuid.uuid4()
    if (user_id := await crud.get_user_id_from_api_key(data.api_key)) is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    await crud.add_image(image_id, user_id, img)

    return UploadImageResponse()


@images_router.delete("/delete")
async def delete_image(
    image_id: uuid.UUID,
    data: Annotated[ApiKeyData, Depends(get_api_key)],
    crud: Annotated[Crud, Depends(Crud.get)],
) -> None:
    if (user_id := await crud.get_user_id_from_api_key(data.api_key)) is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    await crud.delete_image(image_id, user_id)


@images_router.get("/list")
async def list_images(
    request: Request,
    data: Annotated[ApiKeyData, Depends(get_api_key)],
) -> None:
    pass
