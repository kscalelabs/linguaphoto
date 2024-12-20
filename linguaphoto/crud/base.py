"""Defines the base CRUD interface."""

import itertools
import logging
from types import TracebackType
from typing import Any, AsyncContextManager, BinaryIO, Literal, Self, TypeVar

import aioboto3
from boto3.dynamodb.conditions import ComparisonCondition, Key
from botocore.exceptions import ClientError
from types_aiobotocore_dynamodb.service_resource import DynamoDBServiceResource
from types_aiobotocore_s3.service_resource import S3ServiceResource

from linguaphoto.errors import InternalError, ItemNotFoundError
from linguaphoto.models import BaseModel, LinguaBaseModel
from linguaphoto.settings import settings
from linguaphoto.utils.utils import get_cors_origins

T = TypeVar("T", bound=BaseModel)

TABLE_NAME = settings.dynamodb_table_name
DEFAULT_CHUNK_SIZE = 100
DEFAULT_SCAN_LIMIT = 1000
ITEMS_PER_PAGE = 12

TableKey = tuple[str, Literal["S", "N", "B"], Literal["HASH", "RANGE"]]
GlobalSecondaryIndex = tuple[str, str, Literal["S", "N", "B"], Literal["HASH", "RANGE"]]

logger = logging.getLogger(__name__)


class BaseCrud(AsyncContextManager):
    def __init__(self) -> None:
        self.__db: DynamoDBServiceResource | None = None
        self.__s3: S3ServiceResource | None = None

    @property
    def db(self) -> DynamoDBServiceResource:
        if self.__db is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__db

    @property
    def s3(self) -> S3ServiceResource:
        if self.__s3 is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__s3

    @classmethod
    def get_gsi_index_name(cls, colname: str) -> str:
        return f"{colname}-index"

    @classmethod
    def get_gsis(cls) -> set[str]:
        return {"type"}

    async def __aenter__(self) -> Self:
        session = aioboto3.Session()
        db = await session.resource(
            "dynamodb",
            region_name=settings.aws_region_name,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        ).__aenter__()
        s3 = await session.resource(
            "s3",
            region_name=settings.aws_region_name,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        ).__aenter__()
        self.__db = db
        self.__s3 = s3
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        # Check if exc_type is None before using issubclass
        exception_type = exc_type if exc_type is not None and issubclass(exc_type, Exception) else None
        exception_value = exc_value if isinstance(exc_value, Exception) else None

        # Pass compatible Exception types to aioboto3's __aexit__
        if self.__db:
            await self.__db.__aexit__(exception_type, exception_value, traceback)
        if self.__s3:
            await self.__s3.__aexit__(exception_type, exception_value, traceback)

    def _validate_item(self, data: dict[str, Any], item_class: type[T]) -> T:
        if (item_type := data.pop("type")) != item_class.__name__:
            raise InternalError(f"Item type {str(item_type)} is not a {item_class.__name__}")
        return item_class.model_validate(data)

    async def _add_item(self, item: LinguaBaseModel, unique_fields: list[str] | None = None) -> None:
        table = await self.db.Table(TABLE_NAME)
        item_data = item.__dict__

        # Ensure no empty strings are present
        item_data = {k: v for k, v in item_data.items() if v is not None and v != ""}

        # DynamoDB-specific requirements
        if "type" in item_data:
            raise InternalError("Cannot add item with 'type' attribute")
        item_data["type"] = item.__class__.__name__

        # Prepare the condition expression
        condition = "attribute_not_exists(id)"
        if unique_fields:
            for field in unique_fields:
                assert hasattr(item, field), f"Item does not have field {field}"
            condition += " AND " + " AND ".join(f"attribute_not_exists({field})" for field in unique_fields)

        # Log the item data before insertion for debugging purposes
        logger.info("Inserting item into DynamoDB: %s", item_data)
        print(condition)
        try:
            await table.put_item(
                Item=item_data,
                ConditionExpression=condition,
            )
        except ClientError:
            logger.exception("Failed to insert item into DynamoDB")
            raise

    async def _get_item(self, item_id: str, item_class: type[T], throw_if_missing: bool = False) -> T | None:
        table = await self.db.Table(TABLE_NAME)
        item_dict = await table.get_item(Key={"id": item_id})
        if "Item" not in item_dict:
            if throw_if_missing:
                raise ItemNotFoundError
            return None
        item_data = item_dict["Item"]
        return self._validate_item(item_data, item_class)

    async def _get_items_from_secondary_index(
        self,
        secondary_index_name: str,
        secondary_index_value: str,
        item_class: type[T],
        additional_filter_expression: ComparisonCondition | None = None,
    ) -> list[T]:
        filter_expression: ComparisonCondition = Key("type").eq(item_class.__name__)
        if additional_filter_expression is not None:
            filter_expression &= additional_filter_expression
        table = await self.db.Table(TABLE_NAME)
        item_dict = await table.query(
            IndexName=self.get_gsi_index_name(secondary_index_name),
            KeyConditionExpression=Key(secondary_index_name).eq(secondary_index_value),
            FilterExpression=filter_expression,
        )
        items = item_dict["Items"]
        return [self._validate_item(item, item_class) for item in items]

    async def _update_item(
        self,
        id: str,
        model_type: type[T],
        updates: dict[str, Any],
    ) -> None:
        key = {"id": id}

        update_expression = "SET " + ", ".join(f"#{k} = :{k}" for k in updates.keys())
        expression_attribute_values = {f":{k}": v for k, v in updates.items()}
        expression_attribute_names = {f"#{k}": k for k in updates.keys()}

        try:
            await self.db.meta.client.update_item(
                TableName=TABLE_NAME,
                Key=key,
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames=expression_attribute_names,
                ReturnValues="NONE",
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "ValidationException":
                raise ValueError(f"Invalid update: {str(e)}")
            raise

    async def _delete_item(self, item: LinguaBaseModel | str) -> None:
        table = await self.db.Table(TABLE_NAME)
        await table.delete_item(Key={"id": item if isinstance(item, str) else item.id})

    async def _create_dynamodb_table(
        self,
        name: str,
        keys: list[TableKey],
        gsis: list[GlobalSecondaryIndex] | None = None,
        deletion_protection: bool = False,
    ) -> None:
        """Creates a table in the Dynamo database if a table of that name does not already exist.

        Args:
            name: Name of the table.
            keys: Primary and secondary keys. Do not include non-key attributes.
            gsis: Making an attribute a GSI is required in order to query
                against it. Note HASH on a GSI does not actually enforce
                uniqueness. Instead, the difference is: you cannot query
                RANGE fields alone, but you may query HASH fields.
            deletion_protection: Whether the table is protected from being
                deleted.
        """
        try:
            await self.db.meta.client.describe_table(TableName=name)
            logger.info("Found existing table %s", name)
        except ClientError:
            logger.info("Creating %s table", name)

            if gsis:
                table = await self.db.create_table(
                    AttributeDefinitions=[
                        {"AttributeName": n, "AttributeType": t}
                        for n, t in itertools.chain(((n, t) for (n, t, _) in keys), ((n, t) for _, n, t, _ in gsis))
                    ],
                    TableName=name,
                    KeySchema=[{"AttributeName": n, "KeyType": t} for n, _, t in keys],
                    GlobalSecondaryIndexes=(
                        [
                            {
                                "IndexName": i,
                                "KeySchema": [{"AttributeName": n, "KeyType": t}],
                                "Projection": {"ProjectionType": "ALL"},
                            }
                            for i, n, _, t in gsis
                        ]
                    ),
                    DeletionProtectionEnabled=deletion_protection,
                    BillingMode="PAY_PER_REQUEST",
                )

            else:
                table = await self.db.create_table(
                    AttributeDefinitions=[
                        {"AttributeName": n, "AttributeType": t} for n, t in ((n, t) for (n, t, _) in keys)
                    ],
                    TableName=name,
                    KeySchema=[{"AttributeName": n, "KeyType": t} for n, _, t in keys],
                    DeletionProtectionEnabled=deletion_protection,
                    BillingMode="PAY_PER_REQUEST",
                )

            await table.wait_until_exists()

    async def _list_items(
        self,
        item_class: type[T],
        expression_attribute_names: dict[str, str] | None = None,
        expression_attribute_values: dict[str, Any] | None = None,
        filter_expression: str | None = None,
        offset: int | None = None,
        limit: int = DEFAULT_SCAN_LIMIT,
    ) -> list[T]:
        table = await self.db.Table(TABLE_NAME)

        query_params = {
            "IndexName": "type-index",
            "KeyConditionExpression": Key("type").eq(item_class.__name__),
            "Limit": limit,
        }

        if expression_attribute_names:
            query_params["ExpressionAttributeNames"] = expression_attribute_names
        if expression_attribute_values:
            query_params["ExpressionAttributeValues"] = expression_attribute_values
        if filter_expression:
            query_params["FilterExpression"] = filter_expression
        if offset:
            query_params["ExclusiveStartKey"] = {"id": offset}

        items = (await table.query(**query_params))["Items"]
        return [self._validate_item(item, item_class) for item in items]

    async def _upload_to_s3(self, file: BinaryIO, unique_filename: str) -> None:
        bucket = await self.s3.Bucket(settings.bucket_name)
        await bucket.upload_fileobj(file, f"uploads/{unique_filename}")

    async def _create_s3_bucket(self) -> None:
        """Creates an S3 bucket if it does not already exist."""
        try:
            await self.s3.meta.client.head_bucket(Bucket=settings.bucket_name)
            logger.info("Found existing bucket %s", settings.bucket_name)
        except ClientError:
            logger.info("Creating %s bucket", settings.bucket_name)
            await self.s3.create_bucket(Bucket=settings.bucket_name)

            logger.info("Updating %s CORS configuration", settings.bucket_name)
            s3_cors = await self.s3.BucketCors(settings.bucket_name)
            await s3_cors.put(
                CORSConfiguration={
                    "CORSRules": [
                        {
                            "AllowedHeaders": ["*"],
                            "AllowedMethods": ["GET"],
                            "AllowedOrigins": get_cors_origins(),
                            "ExposeHeaders": ["ETag"],
                        }
                    ]
                },
            )

    async def _delete_dynamodb_table(self, name: str) -> None:
        """Deletes a table in the Dynamo database.

        Args:
            name: Name of the table.
        """
        try:
            table = await self.db.Table(name)
            await table.delete()
            logger.info("Deleted table %s", name)
        except ClientError:
            logger.info("Table %s does not exist", name)

    async def _delete_s3_bucket(self) -> None:
        """Deletes an S3 bucket."""
        bucket = await self.s3.Bucket(settings.bucket_name)
        logger.info("Deleting bucket %s", settings.bucket_name)
        async for obj in bucket.objects.all():
            await obj.delete()
        await bucket.delete()
