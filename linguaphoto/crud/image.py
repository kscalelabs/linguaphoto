"""Defines CRUD interface for Image API."""

import os
import uuid
from typing import List

from boto3.dynamodb.conditions import Key
from crud.base import BaseCrud
from errors import ItemNotFoundError
from fastapi import HTTPException, UploadFile
from models import Collection, Image
from settings import settings
from utils.cloudfront_url_signer import CloudFrontUrlSigner

key_pair_id = settings.key_pair_id
media_hosting_server = settings.media_hosting_server


class ImageCrud(BaseCrud):
    async def create_image(self, file: UploadFile, user_id: str, collection_id: str) -> Image:
        if file.filename is None or not file.filename:
            raise HTTPException(status_code=400, detail="File name is missing.")
        # Generate a unique file name
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "unknown"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        # Create an instance of CloudFrontUrlSigner
        private_key_path = os.path.abspath("private_key.pem")
        cfs = CloudFrontUrlSigner(str(key_pair_id), private_key_path)
        # Generate a signed URL
        url = f"{media_hosting_server}/{unique_filename}"
        custom_policy = cfs.create_custom_policy(url, expire_days=100)
        s3_url = cfs.generate_presigned_url(url, custom_policy)
        # Upload the file to S3
        await self._upload_to_s3(file.file, unique_filename)
        # Create new Image
        new_image = Image.create(image_url=s3_url, user_id=user_id, collection_id=collection_id)
        await self._add_item(new_image)
        collection = await self._get_item(collection_id, Collection, True)
        if collection:
            collection.images.append(new_image.id)
            await self._update_item(collection.id, Collection, {"images": collection.images})
            return new_image
        raise ItemNotFoundError

    async def get_images(self, collection_id: str, user_id: str) -> List[Image]:
        images = await self._get_items_from_secondary_index("user", user_id, Image, Key("collection").eq(collection_id))
        return images
