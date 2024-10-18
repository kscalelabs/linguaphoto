"""Collection API."""

from typing import List

from fastapi import APIRouter, Depends

from linguaphoto.crud.collection import CollectionCrud
from linguaphoto.models import Collection
from linguaphoto.schemas.collection import (
    CollectionCreateFragment,
    CollectionEditFragment,
    CollectionPublishFragment,
    FeaturedImageFragnment,
)
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
) -> Collection:
    async with collection_crud:
        collection = await collection_crud.get_collection(id)
        if collection is None:
            raise ValueError
        # if collection.user != user_id:
        #     raise NotAuthorizedError
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
            updates={
                "title": collection.title,
                "description": collection.description,
                "images": collection.images,
                "featured_image": collection.featured_image,
            },
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


@router.post("/set_featured_image", response_model=None)
async def setfeaturedimage(
    data: FeaturedImageFragnment,
    user_id: str = Depends(get_current_user_id),
    collection_crud: CollectionCrud = Depends(),
) -> None:
    async with collection_crud:
        await collection_crud.edit_collection(data.collection_id, updates={"featured_image": data.image_url})
        return


@router.post("/publish_collection")
async def publishcollection(
    data: CollectionPublishFragment,
    user_id: str = Depends(get_current_user_id),
    collection_crud: CollectionCrud = Depends(),
) -> None:
    async with collection_crud:
        await collection_crud.edit_collection(data.id, updates={"publish_flag": data.flag})
        return


@router.get("/public_collections")
async def publiccoleections(
    collection_crud: CollectionCrud = Depends(),
) -> List[Collection]:
    async with collection_crud:
        collections = await collection_crud.get_public_collections()
        return collections
