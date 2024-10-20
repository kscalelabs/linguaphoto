"""Uses the OpenAI API to convert text to speech."""

import argparse
import asyncio
import logging
from pathlib import Path
from typing import AsyncIterator

from openai import AsyncOpenAI

from linguaphoto.ai.transcribe import TranscriptionResponse

logger = logging.getLogger(__name__)


async def synthesize_text(text: str, client: AsyncOpenAI) -> AsyncIterator[bytes]:
    """Synthesizes the text to speech.

    Args:
        text: The text to synthesize.
        client: The OpenAI client.

    Returns:
        The synthesized speech.
    """
    response = await client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text,
    )
    return await response.aiter_bytes()


async def run_adhoc_test() -> None:
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description="Transcribe an image to text.")
    parser.add_argument("transcription", type=str, help="The path to the transcribed image.")
    parser.add_argument("output", type=str, help="The path to save the transcription.")
    args = parser.parse_args()

    with open(args.transcription, "r") as file:
        transcription_response = TranscriptionResponse.model_validate_json(file.read())

    client = AsyncOpenAI()
    (root_dir := Path(args.output)).mkdir(parents=True, exist_ok=True)
    for i, transcription in enumerate(transcription_response.transcriptions):
        text = transcription.text
        audio_path = root_dir / f"audio_{i}.mp3"
        with open(audio_path, "wb") as file:
            async for chunk in await synthesize_text(text, client):
                file.write(chunk)
        logger.info("Synthesized speech saved to %s", audio_path)


if __name__ == "__main__":
    # python -m linguaphoto.ai.tts
    asyncio.run(run_adhoc_test())
