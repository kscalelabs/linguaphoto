"""Defines the bot environment settings."""

from dataclasses import dataclass, field

from omegaconf import II, MISSING


@dataclass
class RedisSettings:
    host: str = field(default=II("oc.env:LINGUAPHOTO_REDIS_HOST"))
    password: str = field(default=II("oc.env:LINGUAPHOTO_REDIS_PASSWORD"))
    port: int = field(default=6379)
    db: int = field(default=0)


@dataclass
class CryptoSettings:
    expire_token_minutes: int = field(default=10)
    expire_otp_minutes: int = field(default=10)
    jwt_secret: str = field(default=MISSING)
    algorithm: str = field(default="HS256")


@dataclass
class TestUserSettings:
    email: str = field(default=MISSING)
    google_token: str = field(default=MISSING)


@dataclass
class UserSettings:
    test_user: TestUserSettings | None = field(default_factory=TestUserSettings)
    auth_lifetime_seconds: int = field(default=604800)  # 1 week


@dataclass
class SiteSettings:
    homepage: str = field(default=MISSING)
    image_url: str | None = field(default=None)


@dataclass
class AWSSettings:
    image_bucket_id: str = field(default=MISSING)
    cloudfront_url: str | None = field(default=None)


@dataclass
class ImageSettings:
    max_upload_width: int = field(default=4096)
    max_upload_height: int = field(default=4096)
    thumbnail_width: int = field(default=256)


@dataclass
class EnvironmentSettings:
    redis: RedisSettings = field(default_factory=RedisSettings)
    user: UserSettings = field(default_factory=UserSettings)
    crypto: CryptoSettings = field(default_factory=CryptoSettings)
    site: SiteSettings = field(default_factory=SiteSettings)
    aws: AWSSettings = field(default_factory=AWSSettings)
    image: ImageSettings = field(default_factory=ImageSettings)
    debug: bool = field(default=False)
