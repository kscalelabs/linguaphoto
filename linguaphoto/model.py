"""Defines the table models for the API.

These correspond directly with the rows in our database, and provide helper
methods for converting from our input data into the format the database
expects (for example, converting a UUID into a string).
"""

import uuid

from pydantic import BaseModel

from linguaphoto.crypto import hash_api_key


class User(BaseModel):
    user_id: str  # Primary key
    email: str


class ApiKey(BaseModel):
    """Stored in Redis rather than DynamoDB."""

    api_key_hash: str  # Primary key
    user_id: str
    lifetime: int

    @classmethod
    def from_api_key(cls, api_key: uuid.UUID, user_id: uuid.UUID, lifetime: int) -> "ApiKey":
        api_key_hash = hash_api_key(api_key)
        return cls(api_key_hash=api_key_hash, user_id=str(user_id), lifetime=lifetime)


class Image(BaseModel):
    image_id: str  # Primary key
    user_id: str
    url: str


class Transcription(BaseModel):
    transcript: str
    pinyin: str
    translation: str


class Transcriptions(BaseModel):
    transcript_id: str  # Primary key
    image_id: str
    user_id: str
    transcriptions: list[Transcription]
