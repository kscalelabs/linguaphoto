"""Defines a single CLI for calling the pipeline on an image."""

import argparse
import asyncio
import logging
from io import BytesIO
from pathlib import Path

from openai import AsyncOpenAI
from PIL import Image

from linguaphoto.ai.transcribe import transcribe_image
from linguaphoto.ai.tts import synthesize_text

logger = logging.getLogger(__name__)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description="Transcribe an image to text and synthesize it to speech.")
    parser.add_argument("image", type=str, help="The path to the image to transcribe.")
    parser.add_argument("output", type=str, help="The path to save the transcription and synthesized speech.")
    args = parser.parse_args()

    (root_dir := Path(args.output)).mkdir(parents=True, exist_ok=True)

    # Transcribes the image.
    image = Image.open(args.image)
    client = AsyncOpenAI(
        api_key="sk-svcacct-PFETCFHtqmHOmIpP_IAyQfBGz5LOpvC6Zudj7d5Wcdp9WjJT4ImAxuotGcpyT3BlbkFJRbtswQqIxYHam9TN13mCM04_OTZE-v8z-Rw1WEcwzyZqW_GcK0PNNyFp6BcA"
    )
    # Convert the ImageFile to BytesIO
    image_bytes = BytesIO()
    image.save(image_bytes, format="JPEG")  # Use the appropriate format for your image
    image_bytes.seek(0)  # Reset the stream position to the beginning

    # Now call the transcribe_image function with the BytesIO object
    transcription_response = await transcribe_image(image_bytes, client)
    print(transcription_response.model_dump_json(indent=2))
    with open(root_dir / "transcription.json", "w") as file:
        file.write(transcription_response.model_dump_json(indent=2))
    logger.info("Transcription saved to %s", args.output)

    # Runs TTS on the image text.
    for i, transcription in enumerate(transcription_response.transcriptions):
        text = transcription.text
        audio_path = root_dir / f"audio_{i}.mp3"
        with open(audio_path, "wb") as file:
            async for chunk in await synthesize_text(text, client):
                file.write(chunk)
        logger.info("Synthesized speech saved to %s", audio_path)


if __name__ == "__main__":
    # python -m linguaphoto.ai.cli
    asyncio.run(main())
