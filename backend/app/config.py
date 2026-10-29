"""
Configuration module for Naive Art Sculpture Gallery backend.
Reads configuration from environment variables with sensible defaults
for local development and production AWS Serverless execution.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "prod"
    LOG_LEVEL: str = "INFO"

    # DynamoDB table names
    SCULPTURES_TABLE: str = "naive-sculpture-gallery-sculptures"
    ORDERS_TABLE: str = "naive-sculpture-gallery-orders"

    # S3 and CloudFront CDN
    MEDIA_BUCKET: str = "naive-sculpture-gallery-media"
    CLOUDFRONT_DOMAIN: str = ""

    # Amazon SNS
    SNS_TOPIC_ARN: str = ""
    ARTIST_NOTIFICATION_EMAIL: str = "artist@naive-sculptures.art"

    # Amazon Cognito
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    AWS_REGION: str = "eu-central-1"

    # Security & Rate Limiting
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    RATE_LIMIT_ORDERS_PER_IP_MINUTE: int = 5

    # Demo / Local dev mode flag
    USE_LOCAL_MOCK_DATA: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
