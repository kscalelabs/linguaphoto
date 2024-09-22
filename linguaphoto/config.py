"""Module for managing DynamoDB resource connections using aioboto3.

This module provides an asynchronous function to obtain a DynamoDB resource
using aioboto3. It handles the setup of the session and manages credentials
for connecting to AWS DynamoDB.

Dependencies:
- aioboto3: Asynchronous wrapper for boto3, used for interacting with AWS services.
- botocore.exceptions: Provides exceptions related to AWS credentials errors.

Functions:
- get_dynamodb_resource() -> any:
    Creates and returns an asynchronous DynamoDB resource using the provided
    AWS credentials and region. If credentials are not available, logs an
    error message and returns None.

Settings:
- The function relies on configuration settings for AWS credentials and region,
  imported from the `settings` module.
"""

from typing import Any

import aioboto3
import aioboto3.session
from botocore.exceptions import NoCredentialsError

from linguaphoto.settings import settings


async def get_dynamodb_resource() -> Any:  # noqa: ANN401
    try:
        session = aioboto3.Session()
        async with session.resource(
            "dynamodb",
            region_name=settings.aws_region_name,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        ) as dynamodb:
            return dynamodb
    except NoCredentialsError:
        print("Credentials not available")
        return None
