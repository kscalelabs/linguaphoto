"""Image APIs."""

from typing import Annotated, List

from crud.image import ImageCrud
from fastapi import APIRouter, Depends, File, Form, UploadFile
from models import Image
from pydantic import BaseModel
from utils.auth import get_current_user_id


class TranslateFramgement(BaseModel):
    images: List[str]


router = APIRouter()


@router.post("/upload", response_model=Image)
async def upload_image(
    file: UploadFile = File(...),
    id: Annotated[str, Form()] = "",
    user_id: str = Depends(get_current_user_id),
    image_crud: ImageCrud = Depends(),
) -> Image:
    """Upload Image and create new Image."""
    async with image_crud:
        image = await image_crud.create_image(file, user_id, id)
        return image


@router.get("/get_images", response_model=List[Image])
async def get_images(
    collection_id: str, user_id: str = Depends(get_current_user_id), image_crud: ImageCrud = Depends()
) -> List[Image]:
    async with image_crud:
        images = await image_crud.get_images(collection_id=collection_id, user_id=user_id)
        return images


@router.post("/translate", response_model=List[Image])
async def translate(
    data: TranslateFramgement, user_id: str = Depends(get_current_user_id), image_crud: ImageCrud = Depends()
) -> List[Image]:
    async with image_crud:
        images = await image_crud.translate(data.images, user_id=user_id)
        return images
