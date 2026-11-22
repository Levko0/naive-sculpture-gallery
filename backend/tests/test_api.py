"""
Comprehensive automated tests for Naive Art Sculpture Gallery backend.
Tests catalog, atomic reservation logic, honeypot protection, mandatory buyer email,
localized customer confirmations (UA/EN), admin CRUD, and upload URLs.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app, _order_ip_tracker
from app.db import dev_store
from app.config import settings

# Force local mock store for isolated test suite execution
settings.USE_LOCAL_MOCK_DATA = True

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """Resets in-memory dev store before each test and keeps reservation test fixtures AVAILABLE."""
    dev_store.reset()
    for sid in ("sculpt-007", "sculpt-008", "sculpt-009", "sculpt-010", "sculpt-011", "sculpt-013"):
        if sid in dev_store.sculptures:
            dev_store.sculptures[sid]["status"] = "AVAILABLE"
    _order_ip_tracker.clear()


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
    assert len(items) >= 12
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
    response = client.get("/api/sculptures?material=мармур")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    for item in items:
        assert "мармур" in item["material_ua"].lower() or "marble" in item["material_en"].lower()


def test_get_sculpture_by_slug():
    response = client.get("/api/sculptures/slug/anhelyk-marmur")
    assert response.status_code == 200
    sculpture = response.json()
    assert sculpture["slug"] == "anhelyk-marmur"
    assert "Ангелик" in sculpture["title_ua"]


def test_get_nonexistent_sculpture_slug():
    response = client.get("/api/sculptures/slug/nonexistent-item-999")
    assert response.status_code == 404


def test_order_atomic_reservation_success_with_email_and_locale_ua():
    payload = {
        "sculpture_id": "sculpt-007",
        "buyer_name": "Оксана Шевченко",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@oksana_art",
        "email": "oksana@artgallery.ua",
        "locale": "ua",
        "delivery_city_country": "Київ, Україна",
        "delivery_method": "Нова Пошта (Відділення 42)",
        "comment": "Прошу надіслати додаткові фото пакування."
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 200
    order = response.json()
    assert order["sculpture_id"] == "sculpt-007"
    assert order["email"] == "oksana@artgallery.ua"
    assert order["locale"] == "ua"
    assert order["status"] == "PENDING_COORDINATION"
    assert order["reservation_code"].startswith("NSG-")

    # Verify sculpture status was atomically flipped to RESERVED
    sculpture_resp = client.get("/api/sculptures/sculpt-007")
    assert sculpture_resp.json()["status"] == "RESERVED"


def test_order_reservation_english_locale():
    payload = {
        "sculpture_id": "sculpt-008",
        "buyer_name": "David Miller",
        "contact_channel": "EMAIL",
        "email": "david.miller@collectors.uk",
        "locale": "en",
        "delivery_city_country": "London, United Kingdom",
        "delivery_method": "DHL Express International",
        "comment": "Please advise on international wooden crate shipping."
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 200
    order = response.json()
    assert order["email"] == "david.miller@collectors.uk"
    assert order["locale"] == "en"
    assert order["sculpture_title_en"] == "Daydreaming Maiden"


def test_order_missing_mandatory_email_rejected():
    payload = {
        "sculpture_id": "sculpt-009",
        "buyer_name": "Тарас",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@taras",
        "delivery_city_country": "Львів",
        "delivery_method": "Нова Пошта"
        # email is missing!
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 422


def test_order_invalid_email_format_rejected():
    payload = {
        "sculpture_id": "sculpt-009",
        "buyer_name": "Тарас",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@taras",
        "email": "not-an-email-at-all",
        "delivery_city_country": "Львів",
        "delivery_method": "Нова Пошта"
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 422


def test_order_atomic_reservation_duplicate_conflict():
    payload1 = {
        "sculpture_id": "sculpt-010",
        "buyer_name": "Тарас",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@taras_folk",
        "email": "taras@example.com",
        "delivery_city_country": "Львів",
        "delivery_method": "Нова Пошта"
    }
    resp1 = client.post("/api/orders", json=payload1)
    assert resp1.status_code == 200

    # Second buyer tries to reserve the exact same sculpture
    payload2 = {
        "sculpture_id": "sculpt-010",
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
        "sculpture_id": "sculpt-011",
        "buyer_name": "SpamBot",
        "contact_channel": "EMAIL",
        "email": "bot@spammer.org",
        "delivery_city_country": "Nowhere",
        "delivery_method": "Post",
        "website_hp": "http://spam-link.com"  # Honeypot filled!
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 422  # Validation error rejected by Pydantic


def test_order_inquiry_on_artwork():
    payload = {
        "sculpture_id": "sculpt-012",
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
    assert order["sculpture_id"] == "sculpt-012"
    assert order["email"] == "maria@artcollectors.com"


def test_admin_order_status_workflow():
    # Reserve sculpt-013
    order_resp = client.post("/api/orders", json={
        "sculpture_id": "sculpt-013",
        "buyer_name": "Олена",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@olena_art",
        "email": "olena@art.ua",
        "delivery_city_country": "Полтава",
        "delivery_method": "Нова Пошта"
    })
    assert order_resp.status_code == 200
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
    sculpture = client.get("/api/sculptures/sculpt-013").json()
    assert sculpture["status"] == "SOLD"

    # Now simulate cancelled order -> sculpture should return to AVAILABLE
    patch_cancel = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "CANCELLED", "admin_notes": "Покупець скасував бронювання."},
        headers=auth_headers
    )
    assert patch_cancel.status_code == 200
    sculpture_after = client.get("/api/sculptures/sculpt-013").json()
    assert sculpture_after["status"] == "AVAILABLE"


def test_artist_notification_email_formatting_and_destination():
    from app.notifications import (
        format_order_notification_email,
        format_artist_order_notification_html,
        send_order_notification
    )
    sample_order = {
        "id": "ord-test-123",
        "reservation_code": "NSG-ARTIST",
        "sculpture_title_ua": "Ангелик",
        "sculpture_title_en": "Little Angel",
        "price_uah": 32000,
        "is_inquiry": False,
        "buyer_name": "Михайло",
        "contact_channel": "TELEGRAM",
        "telegram_handle": "@mykhailo",
        "email": "mykhailo@example.com",
        "delivery_city_country": "Львів",
        "delivery_method": "Нова Пошта",
        "comment": "Дякую майстру!",
        "locale": "ua",
        "created_at": "2026-11-16T19:50:00Z"
    }
    assert settings.ARTIST_NOTIFICATION_EMAIL == "sculptures.zh@gmail.com"

    text = format_order_notification_email(sample_order)
    assert "NSG-ARTIST" in text
    assert "mykhailo@example.com" in text
    assert "@mykhailo" in text

    html = format_artist_order_notification_html(sample_order)
    assert "NSG-ARTIST" in html
    assert "mykhailo@example.com" in html
    assert "Ангелик" in html

    res = send_order_notification(sample_order)
    assert res is True


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


def test_prod_rejects_dev_admin_token():
    """In production mode, dev/mock admin tokens must never be accepted."""
    prev_mock = settings.USE_LOCAL_MOCK_DATA
    prev_env = settings.ENVIRONMENT
    prev_pool = settings.COGNITO_USER_POOL_ID
    try:
        settings.USE_LOCAL_MOCK_DATA = False
        settings.ENVIRONMENT = "prod"
        settings.COGNITO_USER_POOL_ID = ""

        resp = client.get(
            "/api/admin/orders",
            headers={"Authorization": "Bearer dev-admin-token-12345"}
        )
        assert resp.status_code in (401, 503)

        resp2 = client.get(
            "/api/admin/orders",
            headers={"Authorization": "Bearer mock-admin-token"}
        )
        assert resp2.status_code in (401, 503)
    finally:
        settings.USE_LOCAL_MOCK_DATA = prev_mock
        settings.ENVIRONMENT = prev_env
        settings.COGNITO_USER_POOL_ID = prev_pool


def test_notification_html_escaping():
    from app.notifications import format_artist_order_notification_html, format_buyer_confirmation_email
    xss_order = {
        "reservation_code": "NSG-XSS",
        "sculpture_title_ua": "Ангелик",
        "sculpture_title_en": "Little Angel",
        "price_uah": 1000,
        "buyer_name": "<script>alert(1)</script>",
        "contact_channel": "EMAIL",
        "email": "test@example.com",
        "delivery_city_country": "<b>Lviv</b>",
        "delivery_method": "Nova Poshta",
        "comment": "<img src=x onerror=alert(1)>",
        "locale": "ua",
    }
    artist_html = format_artist_order_notification_html(xss_order)
    assert "<script>" not in artist_html
    assert "&lt;script&gt;" in artist_html
    assert "<img src=x" not in artist_html

    buyer_email = format_buyer_confirmation_email(xss_order)
    assert "<script>" not in buyer_email["html"]
    assert "&lt;script&gt;" in buyer_email["html"]
