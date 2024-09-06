"""Defines CRUD interface for Collection API."""

from typing import List

from crud.base import BaseCrud
from models import Collection


class CollectionCrud(BaseCrud):
    async def create_collection(self, user_id: str, title: str, description: str) -> Collection:
        collection = Collection.create(title=title, description=description, user_id=user_id)
        await self._add_item(collection)
        return collection

    async def get_collection(self, collection_id: str) -> Collection:
        collection = await self._get_item(collection_id, Collection, True)
        return collection

    async def get_collections(self, user_id: str) -> List[Collection]:
        collections = await self._get_items_from_secondary_index("user", user_id, Collection)
        return collections

    async def edit_collection(self, id: str, user_id: str, updates: dict) -> None:
        # TODO: confirm user have the permission to edit this collection.
        await self._update_item(id, Collection, updates)
