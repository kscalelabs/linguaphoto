"""Image schemas for validating and API integration."""

from pydantic import BaseModel


class ImageTranslateFragment(BaseModel):
    image_id: str
