"""Image APIs."""

from crud.image import ImageCrud
from fastapi import APIRouter, Depends, File, UploadFile
from models import Image
from utils.auth import get_current_user_id

router = APIRouter()


@router.post("/upload", response_model=Image)
async def upload_image(
    file: UploadFile = File(...), user_id: str = Depends(get_current_user_id), image_crud: ImageCrud = Depends()
) -> dict:
    """Upload Image and create new Image."""
    async with image_crud:
        image = await image_crud.create_image(file, user_id)
        return image.model_dump()
