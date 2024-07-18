"""Defines CRUD interface for transcriptions API."""

import asyncio
import uuid
from io import BytesIO

from PIL import Image

from linguaphoto.crud.base import BaseCrud
from linguaphoto.settings import settings




class ImagesCrud(BaseCrud):
    async def add_image_transcription(self, transcription_id: uuid.UUID, image_id: uuid.UUID, img: Image.Image) -> None:
        asdf
