"""Configuration settings module for loading environment variables.

This module uses `dotenv` to load environment variables from a `.env` file
and defines a `Settings` class to manage configuration values used in the
application. The settings include AWS credentials, DynamoDB table name,
S3 bucket name, and media hosting server.

Dependencies:
- os: Provides functions for interacting with the operating system, including accessing environment variables.
- dotenv: Used to load environment variables from a `.env` file.
"""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    bucket_name = os.getenv("S3_BUCKET_NAME", "linguaphoto")
    dynamodb_table_name = os.getenv("DYNAMODB_TABLE_NAME", "linguaphoto")
    media_hosting_server = os.getenv("MEDIA_HOSTING_SERVER")
    key_pair_id = os.getenv("KEY_PAIR_ID")
    aws_region_name = os.getenv("AWS_REGION")
    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    stripe_key = os.getenv("STRIPE_API_KEY")
    stripe_price_id = os.getenv("STRIPE_PRODUCT_PRICE_ID", "price_1Q0ZaMKeTo38dsfeSWRDGCEf")


settings = Settings()
