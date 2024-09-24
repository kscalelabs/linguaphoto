"""Defines package-wide utility functions."""

from linguaphoto.settings import settings

LOCALHOST_URLS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]


def get_cors_origins() -> list[str]:
    return list({settings.homepage_url, *LOCALHOST_URLS})
