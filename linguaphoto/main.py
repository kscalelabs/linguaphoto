"""Defines the main entrypoint for the FastAPI app."""

import uvicorn
from api.api import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from settings import settings

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
bucket_name = settings.bucket_name
dynamodb_table_name = settings.dynamodb_table_name
media_hosting_server = settings.media_hosting_server
key_pair_id = settings.key_pair_id

app.include_router(router, prefix="")


# class ImageMetadata(BaseModel):
#     filename: str
#     s3_url: str


# @app.post("/upload/", response_model=ImageMetadata)
# async def upload_image(file: UploadFile = File(...)) -> ImageMetadata:
#     if file.filename is None or not file.filename:
#         raise HTTPException(status_code=400, detail="File name is missing.")

#     try:
#         # Generate a unique file name
#         file_extension = file.filename.split(".")[-1] if "." in file.filename else "unknown"
#         unique_filename = f"{uuid.uuid4()}.{file_extension}"

#         if bucket_name is None:
#             raise HTTPException(status_code=500, detail="Bucket name is not set.")

#         if dynamodb_table_name is None:
#             raise HTTPException(status_code=500, detail="DynamoDB table name is not set.")

#         # Create an instance of CloudFrontUrlSigner
#         private_key_path = os.path.abspath("private_key.pem")
#         cfs = CloudFrontUrlSigner(str(key_pair_id), private_key_path)
#         # Generate a signed URL
#         url = f"{media_hosting_server}/{unique_filename}"
#         custom_policy = cfs.create_custom_policy(url, expire_days=100)
#         s3_url = cfs.generate_presigned_url(url, custom_policy)
#         print(s3_url)
#         # Create an S3 client with aioboto3
#         async with aioboto3.Session().client(
#             "s3",
#             region_name=settings.aws_region_name,
#             aws_access_key_id=settings.aws_access_key_id,
#             aws_secret_access_key=settings.aws_secret_access_key,
#         ) as s3_client:
#             # Upload the file to S3
#             await s3_client.upload_fileobj(file.file, bucket_name, f"uploads/{unique_filename}")

#         # Create a DynamoDB resource with aioboto3
#         async with aioboto3.Session().resource(
#             "dynamodb",
#             region_name=settings.aws_region_name,
#             aws_access_key_id=settings.aws_access_key_id,
#             aws_secret_access_key=settings.aws_secret_access_key,
#         ) as dynamodb:
#             table = await dynamodb.Table(dynamodb_table_name)
#             # Save metadata to DynamoDB
#             await table.put_item(Item={"id": unique_filename, "s3_url": s3_url})

#         return ImageMetadata(filename=unique_filename, s3_url=s3_url)

#     except Exception as e:
#         print(str(e))
#         raise HTTPException(status_code=500, detail=str(e))


# @app.get("/download/{filename}")
# async def download_image(filename: str):
#     try:
#         async with aioboto3.Session().resource(
#             "dynamodb",
#             region_name=settings.aws_region_name,
#             aws_access_key_id=settings.aws_access_key_id,
#             aws_secret_access_key=settings.aws_secret_access_key,
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

if __name__ == "__main__":
    print("Starting webserver...")
    uvicorn.run(app, port=8080, host="0.0.0.0")
