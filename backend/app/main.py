"""
FastAPI application for Naive Art Sculpture Gallery & Storefront.
Serves public catalog, direct-to-card reservations, and authenticated artist admin APIs.
Powered by Mangum for AWS Lambda serverless execution.
"""
import logging
from typing import List, Optional
from collections import defaultdict
import time

from fastapi import FastAPI, HTTPException, Depends, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.config import settings
from app.models import (
    SculptureResponse,
    SculptureCreate,
    SculptureUpdate,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdateRequest,
    PresignedUploadRequest,
    PresignedUploadResponse,
)
from app.db import sculpture_repo, order_repo
from app.s3 import generate_presigned_upload_url
from app.notifications import send_order_notification
from app.auth import get_current_admin

# Setup structured logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("naive_sculptures_api")

app = FastAPI(
    title="Naive Art Sculpture Gallery API",
    description="Museum-grade serverless backend for original handcrafted naive sculptures.",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory IP rate limiter for spam prevention on order placement
_order_ip_tracker = defaultdict(list)


def check_rate_limit(request: Request):
    """Simple sliding-window rate limit for order reservations."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    # Filter timestamps within the last 60 seconds
    _order_ip_tracker[client_ip] = [
        ts for ts in _order_ip_tracker[client_ip] if now - ts < 60
    ]
    if len(_order_ip_tracker[client_ip]) >= settings.RATE_LIMIT_ORDERS_PER_IP_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Забагато запитів. Будь ласка, зачекайте хвилину перед повторною спробою."
        )
    _order_ip_tracker[client_ip].append(now)


# ==============================================================================
# PUBLIC GALLERY ENDPOINTS
# ==============================================================================

@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint for API Gateway and monitoring."""
    return {
        "status": "healthy",
        "service": "naive-sculpture-gallery",
        "environment": settings.ENVIRONMENT
    }


@app.get("/api/sculptures", response_model=List[SculptureResponse], tags=["Catalog"])
async def list_sculptures(
    status: Optional[str] = Query(None, description="Filter by status: AVAILABLE, RESERVED, SOLD"),
    material: Optional[str] = Query(None, description="Filter by material substring"),
    include_sold: bool = Query(True, description="Whether to include sold/archive works")
):
    """Fetches public catalog of sculptures with optional filtering."""
    return sculpture_repo.list_sculptures(
        status=status,
        material=material,
        include_sold=include_sold
    )


@app.get("/api/sculptures/slug/{slug}", response_model=SculptureResponse, tags=["Catalog"])
async def get_sculpture_by_slug(slug: str):
    """Fetches detailed museum record of a sculpture by URL slug."""
    sculpture = sculpture_repo.get_by_slug(slug)
    if not sculpture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Скульптуру зі слагом '{slug}' не знайдено."
        )
    return sculpture


@app.get("/api/sculptures/{sculpture_id}", response_model=SculptureResponse, tags=["Catalog"])
async def get_sculpture_by_id(sculpture_id: str):
    """Fetches sculpture by ID."""
    sculpture = sculpture_repo.get_by_id(sculpture_id)
    if not sculpture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Скульптуру з ID '{sculpture_id}' не знайдено."
        )
    return sculpture


@app.post("/api/orders", response_model=OrderResponse, tags=["Orders"])
async def create_order(order_data: OrderCreate, request: Request):
    """
    Submits a direct-to-card reservation or inquiry for a handcrafted sculpture.
    - Rate-limits submissions.
    - Validates honeypot field.
    - Atomically marks available sculptures as RESERVED.
    - Saves order record.
    - Dispatches instant email notification to the artist via Amazon SNS.
    """
    check_rate_limit(request)

    sculpture = sculpture_repo.get_by_id(order_data.sculpture_id)
    if not sculpture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обрану скульптуру не знайдено в каталозі."
        )

    try:
        order_record = order_repo.create_order_atomic(
            order_input=order_data.model_dump(),
            sculpture=sculpture
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    # Dispatch SNS alert in background
    send_order_notification(order_record)

    return order_record


# ==============================================================================
# PROTECTED ARTIST ADMIN ENDPOINTS (Cognito Authenticated)
# ==============================================================================

@app.get("/api/admin/sculptures", response_model=List[SculptureResponse], tags=["Admin"])
async def admin_list_sculptures(admin=Depends(get_current_admin)):
    """Admin: lists all sculptures including drafts and sold items."""
    return sculpture_repo.list_sculptures(include_sold=True)


@app.post("/api/admin/sculptures", response_model=SculptureResponse, tags=["Admin"])
async def admin_create_sculpture(data: SculptureCreate, admin=Depends(get_current_admin)):
    """Admin: creates a new sculpture catalog entry."""
    existing = sculpture_repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Скульптура зі слагом '{data.slug}' вже існує. Оберіть інший слаг."
        )
    return sculpture_repo.create(data.model_dump())


@app.put("/api/admin/sculptures/{sculpture_id}", response_model=SculptureResponse, tags=["Admin"])
async def admin_update_sculpture(
    sculpture_id: str,
    data: SculptureUpdate,
    admin=Depends(get_current_admin)
):
    """Admin: updates sculpture metadata, images, price, or status."""
    existing = sculpture_repo.get_by_id(sculpture_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Скульптуру не знайдено.")

    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = sculpture_repo.update(sculpture_id, update_dict)
    return updated


@app.delete("/api/admin/sculptures/{sculpture_id}", tags=["Admin"])
async def admin_delete_sculpture(sculpture_id: str, admin=Depends(get_current_admin)):
    """Admin: deletes a sculpture entry."""
    success = sculpture_repo.delete(sculpture_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Скульптуру не знайдено.")
    return {"status": "deleted", "id": sculpture_id}


@app.post("/api/admin/upload-url", response_model=PresignedUploadResponse, tags=["Admin"])
async def admin_get_upload_url(
    req: PresignedUploadRequest,
    admin=Depends(get_current_admin)
):
    """
    Admin: generates S3 Presigned PUT URL for direct browser-to-S3 photo upload.
    Validates file MIME type and constructs immutable CloudFront URL.
    """
    try:
        presigned_url, file_key, public_url = generate_presigned_upload_url(
            filename=req.filename,
            content_type=req.content_type
        )
        return PresignedUploadResponse(
            upload_url=presigned_url,
            file_key=file_key,
            public_url=public_url
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/api/admin/orders", response_model=List[OrderResponse], tags=["Admin"])
async def admin_list_orders(
    status: Optional[str] = Query(None, description="Filter by order status"),
    admin=Depends(get_current_admin)
):
    """Admin: lists incoming acquisition reservations and inquiries."""
    return order_repo.list_orders(status=status)


@app.patch("/api/admin/orders/{order_id}/status", response_model=OrderResponse, tags=["Admin"])
async def admin_update_order_status(
    order_id: str,
    update: OrderStatusUpdateRequest,
    admin=Depends(get_current_admin)
):
    """
    Admin: updates order status and synchronizes sculpture availability:
    - PAID -> Marks sculpture as SOLD.
    - CANCELLED -> Returns sculpture to AVAILABLE.
    - SHIPPED -> Marks order as shipped.
    """
    updated_order = order_repo.update_status(
        order_id=order_id,
        new_status=update.status.value,
        admin_notes=update.admin_notes
    )
    if not updated_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Замовлення не знайдено.")
    return updated_order


# Local dev mock upload simulation endpoint (handles PUT when testing offline)
@app.put("/api/mock-upload/{file_key:path}", tags=["Dev"])
async def mock_upload_sink(file_key: str):
    """Simulates S3 PUT endpoint during offline local development."""
    return JSONResponse(
        status_code=200,
        content={"message": f"Simulated upload for {file_key} accepted."}
    )


# AWS Lambda Mangum Adapter (lifespan off for minimal cold start)
handler = Mangum(app, lifespan="off")
