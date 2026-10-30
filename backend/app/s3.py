"""
S3 storage client and Presigned URL generation for high-resolution sculpture photos.
Ensures uploads bypass API Gateway limits and Lambda execution costs.
Strictly validates file extensions and MIME types.
"""
import uuid
import logging
from typing import Tuple
import boto3
from botocore.config import Config
from app.config import settings

logger = logging.getLogger(__name__)

# Allowed MIME types and mapping to standard extension
ALLOWED_MIME_TYPES = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
}

# 15-minute expiration for presigned upload URLs
PRESIGNED_URL_EXPIRATION_SECONDS = 900


def get_s3_client():
    """Initializes standard S3 client with regional configuration."""
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4")
    )


def generate_presigned_upload_url(filename: str, content_type: str) -> Tuple[str, str, str]:
    """
    Generates a secure Presigned PUT URL for uploading an image directly to S3.
    Returns: (presigned_url, file_key, public_url)
    """
    content_type_lower = content_type.lower().strip()
    if content_type_lower not in ALLOWED_MIME_TYPES:
        raise ValueError(
            f"Invalid content type '{content_type}'. "
            f"Allowed types: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )

    extension = ALLOWED_MIME_TYPES[content_type_lower]
    unique_id = uuid.uuid4().hex
    file_key = f"media/{unique_id}.{extension}"

    # Public URL via CloudFront CDN or relative root path
    if settings.CLOUDFRONT_DOMAIN:
        domain = settings.CLOUDFRONT_DOMAIN.rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        public_url = f"{domain}/{file_key}"
    else:
        public_url = f"/{file_key}"

    # If running in local mock mode without AWS credentials, return a mock URL
    try:
        s3_client = get_s3_client()
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.MEDIA_BUCKET,
                "Key": file_key,
                "ContentType": content_type_lower,
                "CacheControl": "public, max-age=31536000, immutable",
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION_SECONDS,
            HttpMethod="PUT"
        )
    except Exception as e:
        logger.warning(f"Could not generate real AWS S3 presigned URL: {e}. Falling back to mock URL.")
        presigned_url = f"http://localhost:8000/api/mock-upload/{file_key}"

    return presigned_url, file_key, public_url
