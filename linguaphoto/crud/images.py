"""Defines CRUD interface for images API."""

import asyncio
import uuid
from io import BytesIO

from PIL import Image

from linguaphoto.crud.base import BaseCrud
from linguaphoto.settings import settings


def crop_image(img: Image.Image) -> Image.Image:
    width, height = img.size

    if height > width:
        diff = height - width
        box = (0, diff // 2, width, height - (diff + 1) // 2)
    else:
        diff = width - height
        box = (diff // 2, 0, width - (diff + 1) // 2, height)

    target_hw = settings.image.thumbnail_width
    return img.resize((target_hw, target_hw), resample=Image.Resampling.BICUBIC, box=box)


def get_bytes(img: Image.Image) -> bytes:
    img_bytes = BytesIO()
    img.save(img_bytes, format="WEBP")
    img_bytes.seek(0)
    return img_bytes.read()


class ImagesCrud(BaseCrud):
    async def add_image(self, image_id: uuid.UUID, user_id: uuid.UUID, img: Image.Image) -> None:
        # Adds the image to the database.
        table = await self.db.Table("Images")
        await table.put_item(Item={"image_id": str(image_id), "user_id": str(user_id)})

        # Uploads the image to S3.
        key = f"{user_id}/{image_id}"

        cropped_img = crop_image(img)

        await asyncio.gather(
            self.s3.put_object(
                Bucket=settings.aws.image_bucket_id,
                Key=f"{key}/orig.webp",
                Body=get_bytes(img),
            ),
            self.s3.put_object(
                Bucket=settings.aws.image_bucket_id,
                Key=f"{key}/thumb.webp",
                Body=get_bytes(cropped_img),
            ),
        )

    async def get_image_ids(self, user_id: uuid.UUID, offset: int = 0, limit: int = 10) -> list[uuid.UUID]:
        # Gets the image IDs from the database.
        table = await self.db.Table("Images")
        result = await table.query(IndexName="SOMETHING", Limit=limit)
        return [uuid.UUID(key) for key in result.keys()]

    async def delete_image(self, image_id: uuid.UUID, user_id: uuid.UUID) -> None:
        # Deletes the image from the database.
        table = await self.db.Table("Images")
        await table.delete_item(Key={"image_id": str(image_id), "user_id": str(user_id)})

        # Deletes the image from S3.
        key = f"{user_id}/{image_id}.webp"
        await self.s3.delete_object(Bucket=settings.aws.image_bucket_id, Key=key)

    async def get_image_url(self, image_id: uuid.UUID, user_id: uuid.UUID, thumb: bool = False) -> str:
        key = f"{user_id}/{image_id}/{'thumb' if thumb else 'orig'}.webp"

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
