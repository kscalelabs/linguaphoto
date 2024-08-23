"""Defines the main entrypoint for the FastAPI app."""

import os
import uuid

import aioboto3
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Adds CORS middleware.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Retrieve AWS configuration from environment variables
bucket_name = os.getenv("S3_BUCKET_NAME")
dynamodb_table_name = os.getenv("DYNAMODB_TABLE_NAME")


class ImageMetadata(BaseModel):
    filename: str
    s3_url: str


@app.post("/upload/", response_model=ImageMetadata)
async def upload_image(file: UploadFile = File(...)) -> ImageMetadata:
    if file.filename is None or not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing.")

    try:
        # Generate a unique file name
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "unknown"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        if bucket_name is None:
            raise HTTPException(status_code=500, detail="Bucket name is not set.")

        if dynamodb_table_name is None:
            raise HTTPException(status_code=500, detail="DynamoDB table name is not set.")

        # Create an S3 client with aioboto3
        async with aioboto3.Session().client(
            "s3",
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        ) as s3_client:
            # Upload the file to S3
            await s3_client.upload_fileobj(file.file, bucket_name, f"uploads/{unique_filename}")
            s3_url = f"https://{bucket_name}.s3.amazonaws.com/uploads/{unique_filename}"

        # Create a DynamoDB resource with aioboto3
        async with aioboto3.Session().resource(
            "dynamodb",
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        ) as dynamodb:
            table = await dynamodb.Table(dynamodb_table_name)
            # Save metadata to DynamoDB
            await table.put_item(Item={"id": unique_filename, "s3_url": s3_url})

        return ImageMetadata(filename=unique_filename, s3_url=s3_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.get("/download/{filename}")
# async def download_image(filename: str):
#     try:
#         async with aioboto3.Session().resource(
#             "dynamodb",
#             region_name=os.getenv("AWS_REGION"),
#             aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
#             aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
#         ) as dynamodb:
#             table = await dynamodb.Table(dynamodb_table_name)
#             # Retrieve image metadata from DynamoDB
#             response = await table.get_item(Key={"id": filename})

#             if "Item" not in response:
#                 raise HTTPException(status_code=404, detail="Image not found")

#             # Return the S3 URL for download
#             return {"s3_url": response["Item"]["s3_url"]}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello, World!, TEST"}


if __name__ == "__main__":
    print("Starting webserver...")
    uvicorn.run(app, port=8080, host="0.0.0.0")
