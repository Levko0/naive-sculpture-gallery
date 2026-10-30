"""
Comprehensive automated tests for Naive Art Sculpture Gallery backend.
Tests catalog, atomic reservation logic, honeypot protection, admin CRUD, and upload URLs.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import dev_store
from app.config import settings

# Force local mock store for isolated test suite execution
settings.USE_LOCAL_MOCK_DATA = True

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """Resets in-memory dev store before each test."""
    dev_store.reset()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "naive-sculpture-gallery"


def test_list_sculptures_public():
    response = client.get("/api/sculptures")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 4
    first = items[0]
    assert "title_ua" in first
    assert "title_en" in first
    assert "dimensions" in first
    assert "photos" in first
    assert "price_uah" in first


def test_filter_sculptures_by_status():
    response = client.get("/api/sculptures?status=AVAILABLE")
    assert response.status_code == 200
    items = response.json()
    for item in items:
        assert item["status"] == "AVAILABLE"


def test_filter_sculptures_by_material():
    response = client.get("/api/sculptures?material=шамот")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    for item in items:
        assert "шамот" in item["material_ua"].lower() or "chamotte" in item["material_en"].lower()


def test_get_sculpture_by_slug():
    response = client.get("/api/sculptures/slug/zvir-okhoronets-sadu")
    assert response.status_code == 200
    sculpture = response.json()
    assert sculpture["slug"] == "zvir-okhoronets-sadu"
    assert "Звір-Охоронець" in sculpture["title_ua"]


def test_get_nonexistent_sculpture_slug():
    response = client.get("/api/sculptures/slug/nonexistent-item-999")
    assert response.status_code == 404


def test_order_atomic_reservation_success_telegram():
    payload = {
        "sculpture_id": "sculpt-001",
        "buyer_name": "Оксана Шевченко",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@oksana_art",
        "delivery_city_country": "Київ, Україна",
        "delivery_method": "Нова Пошта (Відділення 42)",
        "comment": "Прошу надіслати додаткові фото пакування."
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 200
    order = response.json()
    assert order["sculpture_id"] == "sculpt-001"
    assert order["status"] == "PENDING_COORDINATION"
    assert order["reservation_code"].startswith("NSG-")

    # Verify sculpture status was atomically flipped to RESERVED
    sculpture_resp = client.get("/api/sculptures/sculpt-001")
    assert sculpture_resp.json()["status"] == "RESERVED"


def test_order_atomic_reservation_duplicate_conflict():
    payload1 = {
        "sculpture_id": "sculpt-002",
        "buyer_name": "Тарас",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@taras_folk",
        "delivery_city_country": "Львів",
        "delivery_method": "Нова Пошта"
    }
    resp1 = client.post("/api/orders", json=payload1)
    assert resp1.status_code == 200

    # Second buyer tries to reserve the exact same sculpture
    payload2 = {
        "sculpture_id": "sculpt-002",
        "buyer_name": "Андрій",
        "contact_channel": "EMAIL",
        "email": "andriy@example.com",
        "delivery_city_country": "Одеса",
        "delivery_method": "Кур'єр"
    }
    resp2 = client.post("/api/orders", json=payload2)
    assert resp2.status_code == 409  # Conflict!


def test_order_honeypot_spam_rejection():
    payload = {
        "sculpture_id": "sculpt-005",
        "buyer_name": "SpamBot",
        "contact_channel": "EMAIL",
        "email": "bot@spammer.org",
        "delivery_city_country": "Nowhere",
        "delivery_method": "Post",
        "website_hp": "http://spam-link.com"  # Honeypot filled!
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 422  # Validation error rejected by Pydantic


def test_order_inquiry_on_sold_artwork():
    # sculpt-004 is SOLD in seed data
    payload = {
        "sculpture_id": "sculpt-004",
        "is_inquiry": True,
        "buyer_name": "Марія",
        "contact_channel": "EMAIL",
        "email": "maria@artcollectors.com",
        "delivery_city_country": "Івано-Франківськ",
        "delivery_method": "Нова Пошта",
        "comment": "Чи можливе створення схожої роботи на замовлення?"
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 200
    order = response.json()
    assert order["is_inquiry"] is True
    assert order["sculpture_id"] == "sculpt-004"


def test_admin_order_status_workflow():
    # Reserve sculpt-001
    order_resp = client.post("/api/orders", json={
        "sculpture_id": "sculpt-001",
        "buyer_name": "Олена",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@olena_art",
        "delivery_city_country": "Полтава",
        "delivery_method": "Нова Пошта"
    })
    order_id = order_resp.json()["id"]

    # Admin marks order as PAID -> sculpture should become SOLD
    auth_headers = {"Authorization": "Bearer dev-admin-token-test"}
    patch_resp = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "PAID", "admin_notes": "Кошти зараховано на картку Монобанк."},
        headers=auth_headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "PAID"

    # Check sculpture status is now SOLD
    sculpture = client.get("/api/sculptures/sculpt-001").json()
    assert sculpture["status"] == "SOLD"

    # Now simulate cancelled order -> sculpture should return to AVAILABLE
    patch_cancel = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "CANCELLED", "admin_notes": "Покупець скасував бронювання."},
        headers=auth_headers
    )
    assert patch_cancel.status_code == 200
    sculpture_after = client.get("/api/sculptures/sculpt-001").json()
    assert sculpture_after["status"] == "AVAILABLE"


def test_presigned_upload_url_mime_validation():
    auth_headers = {"Authorization": "Bearer dev-admin-token-test"}

    # Valid webp
    resp = client.post(
        "/api/admin/upload-url",
        json={"filename": "photo.webp", "content_type": "image/webp"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "upload_url" in data
    assert "file_key" in data
    assert data["file_key"].startswith("media/")
    assert data["file_key"].endswith(".webp")

    # Invalid mime type rejected
    invalid_resp = client.post(
        "/api/admin/upload-url",
        json={"filename": "exploit.exe", "content_type": "application/x-msdownload"},
        headers=auth_headers
    )
    assert invalid_resp.status_code == 422
