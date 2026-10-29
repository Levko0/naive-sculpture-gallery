"""
Data models and Pydantic v2 schemas for Naive Art Sculpture Gallery.
Includes validations, multilingual support (UA/EN), and strict typing.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class SculptureStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"


class ContactChannel(str, Enum):
    TELEGRAM = "TELEGRAM"
    EMAIL = "EMAIL"


class OrderStatus(str, Enum):
    PENDING_COORDINATION = "PENDING_COORDINATION"
    PAID = "PAID"
    SHIPPED = "SHIPPED"
    CANCELLED = "CANCELLED"


class PhotoItem(BaseModel):
    url: str
    alt_ua: Optional[str] = "Скульптура в наївному стилі"
    alt_en: Optional[str] = "Naive style handcrafted sculpture"
    is_cover: bool = False
    display_order: int = 0
    width: Optional[int] = None
    height: Optional[int] = None


class SculptureDimensions(BaseModel):
    height_cm: float = Field(gt=0, description="Height in centimeters")
    width_cm: float = Field(gt=0, description="Width in centimeters")
    depth_cm: float = Field(gt=0, description="Depth in centimeters")
    weight_kg: float = Field(gt=0, description="Weight in kilograms")


class SculptureBase(BaseModel):
    title_ua: str = Field(min_length=2, max_length=150, description="Ukrainian title")
    title_en: str = Field(min_length=2, max_length=150, description="English title")
    slug: str = Field(min_length=2, max_length=150, description="URL-friendly unique slug")
    story_ua: str = Field(min_length=10, description="Artist story / concept in Ukrainian")
    story_en: str = Field(min_length=10, description="Artist story / concept in English")
    material_ua: str = Field(min_length=2, description="Material in Ukrainian (e.g., Глина, Шамот)")
    material_en: str = Field(min_length=2, description="Material in English (e.g., Clay, Chamotte)")
    technique_ua: str = Field(default="Ручне ліплення, випал, ангоби, глазур")
    technique_en: str = Field(default="Hand-sculpted, kiln-fired, engobes, glaze")
    year: int = Field(ge=2000, le=2050, default=2024)
    edition_ua: str = Field(default="Єдиний екземпляр (1/1)")
    edition_en: str = Field(default="Unique original (1/1)")
    price_uah: int = Field(gt=0, description="Price in Ukrainian Hryvnia")
    price_eur: Optional[int] = None
    price_usd: Optional[int] = None
    dimensions: SculptureDimensions
    photos: List[PhotoItem] = Field(default_factory=list)
    status: SculptureStatus = SculptureStatus.AVAILABLE
    display_order: int = 0
    is_featured: bool = False

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        clean = v.lower().strip()
        # Keep letters, numbers, hyphens
        import re
        if not re.match(r"^[a-z0-9-]+$", clean):
            raise ValueError("Slug must contain only lowercase letters, digits, and hyphens")
        return clean


class SculptureCreate(SculptureBase):
    pass


class SculptureUpdate(BaseModel):
    title_ua: Optional[str] = None
    title_en: Optional[str] = None
    slug: Optional[str] = None
    story_ua: Optional[str] = None
    story_en: Optional[str] = None
    material_ua: Optional[str] = None
    material_en: Optional[str] = None
    technique_ua: Optional[str] = None
    technique_en: Optional[str] = None
    year: Optional[int] = None
    edition_ua: Optional[str] = None
    edition_en: Optional[str] = None
    price_uah: Optional[int] = None
    price_eur: Optional[int] = None
    price_usd: Optional[int] = None
    dimensions: Optional[SculptureDimensions] = None
    photos: Optional[List[PhotoItem]] = None
    status: Optional[SculptureStatus] = None
    display_order: Optional[int] = None
    is_featured: Optional[bool] = None


class SculptureResponse(SculptureBase):
    id: str
    created_at: str
    updated_at: str


class OrderCreate(BaseModel):
    sculpture_id: str
    is_inquiry: bool = False
    buyer_name: str = Field(min_length=2, max_length=100)
    contact_channel: ContactChannel = ContactChannel.TELEGRAM
    telegram_handle: Optional[str] = None
    email: Optional[str] = None
    delivery_city_country: str = Field(min_length=2, max_length=200)
    delivery_method: str = Field(min_length=2, max_length=100)
    comment: Optional[str] = Field(default=None, max_length=1000)
    website_hp: Optional[str] = None  # Anti-spam Honeypot field

    @model_validator(mode="after")
    def validate_contact_channel_requirements(self) -> "OrderCreate":
        if self.website_hp:
            raise ValueError("Spam bot submission rejected")

        if self.contact_channel == ContactChannel.TELEGRAM:
            if not self.telegram_handle or not self.telegram_handle.strip():
                raise ValueError("Telegram username or phone number is required when Telegram is chosen")
        elif self.contact_channel == ContactChannel.EMAIL:
            if not self.email or "@" not in self.email:
                raise ValueError("Valid email address is required when Email is chosen")
        return self


class OrderResponse(BaseModel):
    id: str
    reservation_code: str
    sculpture_id: str
    sculpture_title_ua: str
    sculpture_title_en: str
    price_uah: int
    is_inquiry: bool
    buyer_name: str
    contact_channel: ContactChannel
    telegram_handle: Optional[str] = None
    email: Optional[str] = None
    delivery_city_country: str
    delivery_method: str
    comment: Optional[str] = None
    status: OrderStatus
    admin_notes: Optional[str] = None
    created_at: str
    updated_at: str


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
    admin_notes: Optional[str] = None


class PresignedUploadRequest(BaseModel):
    filename: str
    content_type: str

    @field_validator("content_type")
    @classmethod
    def validate_mime_type(cls, v: str) -> str:
        allowed = ["image/webp", "image/jpeg", "image/png"]
        if v.lower() not in allowed:
            raise ValueError(f"Content type {v} not permitted. Allowed: {', '.join(allowed)}")
        return v.lower()


class PresignedUploadResponse(BaseModel):
    upload_url: str
    file_key: str
    public_url: str
