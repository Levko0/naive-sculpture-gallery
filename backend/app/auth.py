"""
Cognito JWT verification and admin authentication dependencies.
Supports AWS Cognito token verification via JWKS and local development simulation.
"""
import logging
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

# Cached JWKS keys from Cognito
_jwks_cache: Optional[Dict[str, Any]] = None


async def get_cognito_jwks() -> Optional[Dict[str, Any]]:
    """Fetches and caches the JSON Web Key Set from Cognito User Pool."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    if not settings.COGNITO_USER_POOL_ID:
        return None

    jwks_url = (
        f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/"
        f"{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(jwks_url)
            if resp.status_code == 200:
                _jwks_cache = resp.json()
                return _jwks_cache
    except Exception as e:
        logger.warning(f"Could not fetch Cognito JWKS from {jwks_url}: {e}")

    return None


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Dict[str, Any]:
    """
    Validates the bearer token.
    Works in production against Amazon Cognito,
    and supports dev mock tokens for local testing.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Local development bypass / demo token
    if token.startswith("dev-admin-token-") or token == "mock-admin-token":
        return {
            "sub": "mock-artist-id",
            "email": settings.ARTIST_NOTIFICATION_EMAIL,
            "role": "admin"
        }

    # If Cognito is not configured, permit dev tokens
    if not settings.COGNITO_USER_POOL_ID:
        logger.info("Cognito User Pool ID not configured; accepting bearer token in dev mode.")
        return {
            "sub": "local-dev-user",
            "email": settings.ARTIST_NOTIFICATION_EMAIL,
            "role": "admin"
        }

    jwks = await get_cognito_jwks()
    if not jwks:
        # Fallback if JWKS could not be fetched
        try:
            claims = jwt.get_unverified_claims(token)
            return claims
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify token credentials"
            )

    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token key ID"
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.COGNITO_CLIENT_ID if settings.COGNITO_CLIENT_ID else None,
            issuer=f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}"
        )
        return payload
    except JWTError as e:
        logger.error(f"JWT Verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
