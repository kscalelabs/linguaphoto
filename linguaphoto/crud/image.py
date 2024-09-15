"""Defines CRUD interface for Image API."""

import os
import uuid
from io import BytesIO
from typing import List

import requests
from ai.transcribe import transcribe_image
from ai.tts import synthesize_text
from boto3.dynamodb.conditions import Key
from crud.base import BaseCrud
from errors import ItemNotFoundError
from fastapi import HTTPException, UploadFile
from models import Collection, Image
from openai import AsyncOpenAI
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

    # Handles audio file creation by synthesizing and uploading to S3
    async def create_audio(self, audio_source: BytesIO) -> str:
        # Generate a unique file name with a '.mp3' extension (or other extension based on the format)
        unique_filename = f"{uuid.uuid4()}.mp3"  # You can change the extension based on the actual audio format

        # Create an instance of CloudFrontUrlSigner
        private_key_path = os.path.abspath("private_key.pem")
        cfs = CloudFrontUrlSigner(str(key_pair_id), private_key_path)

        # Generate a signed URL
        url = f"{media_hosting_server}/{unique_filename}"
        custom_policy = cfs.create_custom_policy(url, expire_days=100)
        s3_url = cfs.generate_presigned_url(url, custom_policy)

        # Upload the audio source to S3
        await self._upload_to_s3(audio_source, unique_filename)

        # Return the signed S3 URL
        return s3_url

    async def get_images(self, collection_id: str, user_id: str) -> List[Image]:
        images = await self._get_items_from_secondary_index("user", user_id, Image, Key("collection").eq(collection_id))
        return images

    # Translates the images to text and synthesizes audio for the transcriptions
    async def translate(self, images: List[str], user_id: str) -> List[Image]:
        image_instances = []
        for id in images:
            # Retrieve image metadata and download the image content
            image_instance = await self._get_item(id, Image, True)
            response = requests.get(image_instance.image_url)
            if response.status_code == 200:
                img_source = BytesIO(response.content)
                # Initialize OpenAI client for transcription and speech synthesis
                client = AsyncOpenAI(api_key=settings.openai_key)
                transcription_response = await transcribe_image(img_source, client)
                # Process each transcription and generate corresponding audio
                for i, transcription in enumerate(transcription_response.transcriptions):
                    audio_buffer = BytesIO()
                    text = transcription.text
                    # Synthesize text and write the chunks directly into the in-memory buffer
                    async for chunk in await synthesize_text(text, client):
                        audio_buffer.write(chunk)
                    # Set buffer position to the start
                    audio_buffer.seek(0)
                    audio_url = await self.create_audio(audio_buffer)
                    # Attach the audio URL to the transcription
                    transcription.audio_url = audio_url
                image_instance.transcriptions = transcription_response.transcriptions
                image_instance.is_translated = True
                await self._update_item(
                    id,
                    Image,
                    {"transcriptions": transcription_response.model_dump()["transcriptions"], "is_translated": True},
                )
            if image_instance:
                image_instances.append(image_instance)
        return image_instances
