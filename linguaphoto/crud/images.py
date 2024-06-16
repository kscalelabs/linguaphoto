"""Defines CRUD interface for images API."""

import uuid

from linguaphoto.crud.base import BaseCrud
from linguaphoto.settings import settings


class ImagesCrud(BaseCrud):
    async def add_image(self, image_id: uuid.UUID, user_id: uuid.UUID, image: bytes) -> None:
        # Adds the image to the database.
        table = await self.db.Table("Images")
        await table.put_item(Item={"image_id": str(image_id), "user_id": str(user_id)})

        # Uploads the image to S3.
        key = f"{user_id}/{image_id}"
        await self.s3.put_object(Bucket=settings.aws.image_bucket_id, Key=key, Body=image)

    async def delete_image(self, image_id: uuid.UUID, user_id: uuid.UUID) -> None:
        # Deletes the image from the database.
        table = await self.db.Table("Images")
        await table.delete_item(Key={"image_id": str(image_id), "user_id": str(user_id)})

        # Deletes the image from S3.
        key = f"{user_id}/{image_id}.webp"
        await self.s3.delete_object(Bucket=settings.aws.image_bucket_id, Key=key)

    async def get_image_url(self, image_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
        key = f"{user_id}/{image_id}.webp"

        # If CloudFront is enabled, gets the image URL from CloudFront.
        if settings.aws.cloudfront_url is not None:
            return await self.cf.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.aws.image_bucket_id, "Key": key},
                ExpiresIn=3600,
            )

        # Gets the image URL from S3.
        url = await self.s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.aws.image_bucket_id, "Key": key},
            ExpiresIn=3600,
        )
        return url
