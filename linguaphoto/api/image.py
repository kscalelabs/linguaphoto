"""Image APIs."""

from typing import Annotated, List

from crud.collection import CollectionCrud
from crud.image import ImageCrud
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from models import Image
from pydantic import BaseModel
from utils.auth import get_current_user_id, subscription_validate


class TranslateFramgement(BaseModel):
    images: List[str]


router = APIRouter()


@router.post("/upload", response_model=Image)
async def upload_image(
    file: UploadFile = File(...),
    id: Annotated[str, Form()] = "",
    user_id: str = Depends(get_current_user_id),
    is_subscribed: bool = Depends(subscription_validate),
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


@router.get("/delete_image")
async def delete_image(
    id: str,
    user_id: str = Depends(get_current_user_id),
    image_crud: ImageCrud = Depends(),
    collection_crud: CollectionCrud = Depends(),
) -> None:
    print(id)
    async with image_crud:
        image = await image_crud.get_image(id)
        if image:
            async with collection_crud:
                collection = await collection_crud.get_collection(image.collection)
                updated_images = list(filter(lambda image: image != id, collection.images))
                await collection_crud.edit_collection(image.collection, {"images": updated_images})
                await image_crud.delete_image(id)
                return
    raise HTTPException(status_code=400, detail="Image is invalid")


@router.post("/translate", response_model=List[Image])
async def translate(
    data: TranslateFramgement,
    user_id: str = Depends(get_current_user_id),
    image_crud: ImageCrud = Depends(),
    is_subscribed: bool = Depends(subscription_validate),
) -> List[Image]:
    async with image_crud:
        images = await image_crud.translate(data.images, user_id=user_id)
        return images
