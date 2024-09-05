"""Collection schemas for validating and API integration."""

from pydantic import BaseModel


class CollectionCreateFragment(BaseModel):
    title: str
    description: str


class CollectionEditFragment(BaseModel):
    id: str
    title: str
    description: str
