"""Image APIs."""

import asyncio
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from linguaphoto.crud.collection import CollectionCrud
from linguaphoto.crud.image import ImageCrud
from linguaphoto.models import Image
from linguaphoto.schemas.image import ImageTranslateFragment
from linguaphoto.socket_manager import notify_user
from linguaphoto.utils.auth import get_current_user_id, subscription_validate

router = APIRouter()
translating_images: List[str] = []


async def translate_background(image_id: str, image_crud: ImageCrud, user_id: str) -> None:
    async with image_crud:
        translating_images.append(image_id)
        image = await image_crud.translate(image_id, user_id)
        translating_images.remove(image_id)
        if image:
            await notify_user(user_id, image.model_dump())  # Use await here


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
        if image:
            # Run translate in the background
            asyncio.create_task(translate_background(image.id, image_crud, user_id))
        return image


@router.get("/get_all", response_model=List[Image])
async def get_images(collection_id: str, image_crud: ImageCrud = Depends()) -> List[Image]:
    async with image_crud:
        images = await image_crud.get_images(collection_id=collection_id)
        return images


@router.get("/delete")
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
                if collection:
                    updated_images = list(filter(lambda image: image != id, collection.images))
                    await collection_crud.edit_collection(image.collection, {"images": updated_images})
                await image_crud.delete_image(id)
                return
    raise HTTPException(status_code=400, detail="Image is invalid")


@router.post("/translate", response_model=None)
async def translate(
    data: ImageTranslateFragment,
    user_id: str = Depends(get_current_user_id),
    image_crud: ImageCrud = Depends(),
    is_subscribed: bool = Depends(subscription_validate),
) -> None:
    image_id = data.image_id
    if image_id not in translating_images:
        async with image_crud:
            translating_images.append(image_id)
            asyncio.create_task(translate_background(image_id, image_crud, user_id=user_id))
            translating_images.remove(image_id)
