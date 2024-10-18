"""Uses the OpenAI API to transcribe an image to text."""

import base64
import logging
from io import BytesIO

import aiohttp
from openai import AsyncOpenAI
from PIL import Image

from linguaphoto.models import TranscriptionResponse

logger = logging.getLogger(__name__)

PROMPT = """
This is a photo containing Chinese characters. For each section of characters
in order, provide the transcription, Pinyin, and English translation,
returning it as a JSON object. For example, this is a valid response:

{
    "transcriptions": [
        {
            "text": "你好，我朋友！",
            "pinyin": "nǐhǎo, wǒ péngyǒu!",
            "translation": "Hello, my friend!",
            "audio_url":""
        },
        {
            "text": "我找到了工作。",
            "pinyin": "wǒ zhǎodàole gōngzuò.",
            "translation": "I found a job.",
            "audio_url":""
        }
    ]
}

Return the sections in the canonical order they appear in the image. For
example, when reading manga, read from right to left, top to bottom. When
reading a book, if the text is in columns, read from right to left, top to
bottom. If the text is in rows, read from left to right, top to bottom.
note: the response must be only JSON content without any comment, symbol, or anything.
In case you don't find any Chinese characters, return {"transcriptions": []}
""".strip()


def encode_image(image: Image.Image) -> str:
    buffered = BytesIO()
    if image.mode != "RGB":
        image = image.convert("RGB")
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


async def transcribe_image(image_source: BytesIO, client: AsyncOpenAI) -> TranscriptionResponse:
    image = Image.open(image_source)
    """Transcribes the image to text.

    Args:
        image: The image to transcribe.
        client: The OpenAI client.

    Returns:
        The transcription response.
    """
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {client.api_key}"}
    base64_image = encode_image(image)

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                ],
            }
        ],
        "max_tokens": 1024,
        "response_format": {"type": "json_object"},
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
        ) as response:
            response.raise_for_status()
            data = await response.json()

    raw_response = data["choices"][0]["message"]["content"]
    transcription_response = TranscriptionResponse.model_validate_json(raw_response)
    return transcription_response


# async def run_adhoc_test() -> None:
#     logging.basicConfig(level=logging.INFO)

#     parser = argparse.ArgumentParser(description="Transcribe an image to text.")
#     parser.add_argument("image", type=str, help="The path to the image to transcribe.")
#     parser.add_argument("output", type=str, help="The path to save the transcription.")
#     args = parser.parse_args()

#     image = Image.open(args.image)
#     client = AsyncOpenAI()
#     transcription_response = await transcribe_image(image, client)

#     with open(args.output, "w") as file:
#         file.write(transcription_response.model_dump_json(indent=2))
#     logger.info("Transcription saved to %s", args.output)


# if __name__ == "__main__":
#     # python -m linguaphoto.ai.transcribe
#     asyncio.run(run_adhoc_test())
