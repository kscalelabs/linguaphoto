"""Defines the base CRUD interface."""

import asyncio
import itertools
import logging
from typing import Any, AsyncContextManager, Literal, Self

import aioboto3
from botocore.exceptions import ClientError
from redis.asyncio import Redis
from types_aiobotocore_cloudfront.client import CloudFrontClient
from types_aiobotocore_dynamodb.service_resource import DynamoDBServiceResource
from types_aiobotocore_s3.client import S3Client

from linguaphoto.settings import settings

logger = logging.getLogger(__name__)


class BaseCrud(AsyncContextManager["BaseCrud"]):
    def __init__(self) -> None:
        super().__init__()

        self.__db: DynamoDBServiceResource | None = None
        self.__kv: Redis | None = None
        self.__s3: S3Client | None = None
        self.__cf: CloudFrontClient | None = None

    @property
    def db(self) -> DynamoDBServiceResource:
        if self.__db is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__db

    @property
    def kv(self) -> Redis:
        if self.__kv is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__kv

    @property
    def s3(self) -> S3Client:
        if self.__s3 is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__s3

    @property
    def cf(self) -> CloudFrontClient:
        if self.__cf is None:
            raise RuntimeError("Must call __aenter__ first!")
        return self.__cf

    async def _init_dynamodb(self, session: aioboto3.Session) -> Self:
        db = session.resource("dynamodb")
        await db.__aenter__()
        self.__db = db
        return self

    async def _init_cloudfront(self, session: aioboto3.Session) -> Self:
        cf = session.client("cloudfront")
        await cf.__aenter__()
        self.__cf = cf
        return self

    async def _init_s3(self, session: aioboto3.Session) -> Self:
        s3 = session.client("s3")
        await s3.__aenter__()
        self.__s3 = s3
        return self

    async def _init_redis(self) -> Self:
        kv = Redis(
            host=settings.redis.host,
            password=settings.redis.password,
            port=settings.redis.port,
            db=settings.redis.db,
        )
        await kv.__aenter__()
        self.__kv = kv
        return self

    async def __aenter__(self) -> Self:
        session = aioboto3.Session()

        await asyncio.gather(
            self._init_dynamodb(session),
            self._init_cloudfront(session),
            self._init_s3(session),
            self._init_redis(),
        )

        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:  # noqa: ANN401
        await asyncio.gather(
            self.db.__aexit__(exc_type, exc_val, exc_tb),
            self.cf.__aexit__(exc_type, exc_val, exc_tb),
            self.kv.__aexit__(exc_type, exc_val, exc_tb),
            self.s3.__aexit__(exc_type, exc_val, exc_tb),
        )
        self.__db = None
        self.__kv = None
        self.__s3 = None

    async def _create_dynamodb_table(
        self,
        name: str,
        keys: list[tuple[str, Literal["S", "N", "B"], Literal["HASH", "RANGE"]]],
        gsis: list[tuple[str, str, Literal["S", "N", "B"], Literal["HASH", "RANGE"]]] = [],
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
        except ClientError:
            logger.info("Creating %s table", name)
            table = await self.db.create_table(
                AttributeDefinitions=[
                    {"AttributeName": n, "AttributeType": t}
                    for n, t in itertools.chain(((n, t) for (n, t, _) in keys), ((n, t) for _, n, t, _ in gsis))
                ],
                TableName=name,
                KeySchema=[{"AttributeName": n, "KeyType": t} for n, _, t in keys],
                GlobalSecondaryIndexes=[
                    {
                        "IndexName": i,
                        "KeySchema": [{"AttributeName": n, "KeyType": t}],
                        "Projection": {"ProjectionType": "ALL"},
                    }
                    for i, n, _, t in gsis
                ],
                DeletionProtectionEnabled=deletion_protection,
                BillingMode="PAY_PER_REQUEST",
            )
            await table.wait_until_exists()

    async def _delete_dynamodb_table(self, name: str) -> None:
        """Deletes a table in the Dynamo database.

        Args:
            name: Name of the table.
        """
        try:
            table = await self.db.Table(name)
            await table.delete()
            await table.wait_until_not_exists()
        except ClientError:
            logger.info("Table %s does not exist", name)
            return
