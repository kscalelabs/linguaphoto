"""Collection schemas for validating and API integration."""

from typing import List, Optional

from pydantic import BaseModel


class CollectionCreateFragment(BaseModel):
    title: str
    description: str


class CollectionEditFragment(BaseModel):
    id: str
    title: Optional[str]
    description: Optional[str]
    images: Optional[List[str]]