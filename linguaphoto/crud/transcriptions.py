"""Defines CRUD interface for transcriptions API."""

import uuid

from PIL import Image

from linguaphoto.crud.base import BaseCrud


class ImagesCrud(BaseCrud):
    async def add_image_transcription(self, transcription_id: uuid.UUID, image_id: uuid.UUID, img: Image.Image) -> None:
        asdf
