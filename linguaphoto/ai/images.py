"""Defines utility functions for working with images."""

from PIL import Image


def normalize_image(
    image: Image.Image,
    max_mb: int = 25,
    max_width: int = 2048,
    max_height: int = 2048,
) -> Image.Image:
    """Validates the image bytes.

    Args:
        image: The image to validate.
        max_mb: The maximum size of the image in MB.
        max_width: The maximum width of the image.
        max_height: The maximum height of the image.

    Returns:
        The normalized image.
    """
    image = image.convert("RGB")
    if image.tell() > max_mb * 1024 * 1024:
        raise ValueError(f"Image is too large. Max size is {max_mb} MB.")
    if image.width > max_width or image.height > max_height:
        raise ValueError(f"Image is too large. Max dimensions are {max_width}x{max_height}.")
    return image
