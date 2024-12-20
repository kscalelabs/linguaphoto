"""Defines CRUD interface for Collection API."""

from typing import List

from linguaphoto.crud.base import BaseCrud
from linguaphoto.models import Collection


class CollectionCrud(BaseCrud):
    async def create_collection(self, user_id: str, title: str, description: str) -> Collection:
        collection = Collection.create(title=title, description=description, user_id=user_id)
        await self._add_item(collection)
        return collection

    async def get_collection(self, collection_id: str) -> Collection | None:
        collection = await self._get_item(collection_id, Collection, True)
        return collection

    async def get_collections(self, user_id: str) -> List[Collection]:
        collections = await self._get_items_from_secondary_index("user", user_id, Collection)
        return collections

    async def edit_collection(self, collection_id: str, updates: dict) -> None:
        await self._update_item(collection_id, Collection, updates)

    async def delete_collection(self, collection_id: str) -> None:
        await self._delete_item(collection_id)

    async def get_public_collections(self) -> List[Collection]:
        collections = await self._list_items(
            item_class=Collection,
            filter_expression="#flag=:flag",
            expression_attribute_names={"#flag": "publish_flag"},
            expression_attribute_values={":flag": True},
        )
        return collections
