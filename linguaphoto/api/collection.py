"""Collection API."""

from typing import List

from fastapi import APIRouter, Depends

from linguaphoto.crud.collection import CollectionCrud
from linguaphoto.errors import NotAuthorizedError
from linguaphoto.models import Collection
from linguaphoto.schemas.collection import CollectionCreateFragment, CollectionEditFragment
from linguaphoto.utils.auth import get_current_user_id

router = APIRouter()


@router.post("/create_collection", response_model=Collection)
async def create(
    collection: CollectionCreateFragment,
    user_id: str = Depends(get_current_user_id),
    collection_crud: CollectionCrud = Depends(),
) -> Collection:
    """Create new empty collection.

    parameter: title, description
    """
    async with collection_crud:
        new_collection = await collection_crud.create_collection(
            user_id=user_id, title=collection.title, description=collection.description
        )
        return new_collection


@router.get("/get_collection", response_model=Collection)
async def getcollection(
    id: str, user_id: str = Depends(get_current_user_id), collection_crud: CollectionCrud = Depends()
) -> dict | None:
    async with collection_crud:
        collection = await collection_crud.get_collection(id)
        print(collection)
        if collection.user != user_id:
            raise NotAuthorizedError
        return collection


@router.get("/get_collections", response_model=List[Collection])
async def getcollections(
    user_id: str = Depends(get_current_user_id), collection_crud: CollectionCrud = Depends()
) -> List[Collection]:
    async with collection_crud:
        collections = await collection_crud.get_collections(user_id=user_id)
        return collections


@router.post("/edit_collection")
async def editcollection(
    collection: CollectionEditFragment,
    user_id: str = Depends(get_current_user_id),
    collection_crud: CollectionCrud = Depends(),
) -> None:
    async with collection_crud:
        await collection_crud.edit_collection(
            collection.id,
            updates={"title": collection.title, "description": collection.description, "images": collection.images},
        )
        return


@router.get("/delete_collection")
async def deletecollection(
    id: str,
    user_id: str = Depends(get_current_user_id),
    collection_crud: CollectionCrud = Depends(),
) -> None:
    async with collection_crud:
        await collection_crud.delete_collection(collection_id=id)
        return
