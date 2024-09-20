"""This module defines the API routes for the application.

It sets up the primary API router and includes various sub-routers,
such as the user-related routes. The root endpoint provides a simple
welcome message or can be used as a health check endpoint.

Key Components:
- APIRouter: A FastAPI router instance that groups related routes.
- root(): A simple GET endpoint that returns a greeting message.

This module is intended to be included in the main FastAPI application
to handle routing for the entire API.
"""

from api import collection, image, subscription, user
from fastapi import APIRouter

# Create a new API router
router = APIRouter()

# Include the user-related routes
router.include_router(user.router)
router.include_router(collection.router)
router.include_router(image.router)
router.include_router(subscription.router)


# Define a root endpoint that returns a simple message
@router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello, World!, TEST"}
