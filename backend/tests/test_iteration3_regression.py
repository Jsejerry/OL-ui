"""Iteration 3 backend regression tests: catalog, media range, reels, bookings, coupons/orders."""
import os
from datetime import date, timedelta

import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv('/app/frontend/.env')
load_dotenv('/app/backend/.env')


BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL")
if not BASE_URL:
    pytest.fail("EXPO_PUBLIC_BACKEND_URL is required for API tests", pytrace=False)
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def mongo_db():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("Mongo env vars unavailable for persistence check")
    client = MongoClient(mongo_url)
    db = client[db_name]
    yield db
    client.close()


# ---------- Catalog and filtering ----------
def test_catalog_contains_expected_departments_and_dominos_logo(client):
    response = client.get(f"{API}/catalog", timeout=20)
    assert response.status_code == 200
    data = response.json()
    departments = {p["department"] for p in data["products"]}
    assert {"food", "grocery", "pharmacy", "beauty"}.issubset(departments)
    dominos = next((b for b in data["brands"] if b["id"] == "dominos"), None)
    assert dominos is not None
    assert dominos["logo"].startswith("/api/media/")


def test_products_filter_department_brand_q(client):
    response = client.get(
        f"{API}/products",
        params={"department": "food", "brand_id": "dominos", "q": "pizza"},
        timeout=20,
    )
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(p["department"] == "food" and p["brand_id"] == "dominos" for p in items)


def test_events_filter_kind(client):
    response = client.get(f"{API}/events", params={"kind": "movies"}, timeout=20)
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 1
    assert all(e["kind"] == "movies" for e in events)


# ---------- Media proxy and byte-range ----------
def test_media_get_and_byte_range_for_webm(client):
    full = client.get(f"{API}/media/reel-burger-webm", timeout=30)
    assert full.status_code == 200
    assert "Accept-Ranges" in full.headers
    ranged = client.get(
        f"{API}/media/reel-burger-webm",
        headers={"Range": "bytes=0-255"},
        timeout=30,
    )
    assert ranged.status_code == 206
    assert ranged.headers.get("Content-Range", "").startswith("bytes 0-255/")
    assert len(ranged.content) == 256


def test_media_invalid_range_returns_416(client):
    response = client.get(
        f"{API}/media/reel-burger-webm",
        headers={"Range": "bytes=99999999-999999999"},
        timeout=30,
    )
    assert response.status_code == 416


# ---------- Reels ----------
def test_reels_include_webm_and_product_shape(client):
    response = client.get(f"{API}/reels", timeout=20)
    assert response.status_code == 200
    reels = response.json()
    assert len(reels) >= 3
    first = reels[0]
    assert first["video_web"].endswith("-webm")
    assert "product" in first and first["product"]["id"]


# ---------- Booking enquiry validation + persistence ----------
def test_booking_enquiry_success_persists_to_mongo(client, mongo_db):
    payload = {
        "event_id": "e1",
        "name": "TEST_Test Shopper",
        "phone": "9876543210",
        "date": (date.today() + timedelta(days=1)).isoformat(),
        "slot": "11:00 AM",
        "guests": 2,
    }
    response = client.post(f"{API}/booking-enquiries", json=payload, timeout=20)
    assert response.status_code == 200
    created = response.json()
    assert created["status"] == "demo_enquiry_saved"
    persisted = mongo_db.booking_enquiries.find_one({"id": created["id"]}, {"_id": 0})
    assert persisted is not None
    assert persisted["phone"] == "9876543210"


def test_booking_enquiry_unknown_event_returns_400(client):
    payload = {
        "event_id": "unknown",
        "name": "Test Shopper",
        "phone": "9876543210",
        "date": (date.today() + timedelta(days=1)).isoformat(),
        "slot": "11:00 AM",
        "guests": 2,
    }
    response = client.post(f"{API}/booking-enquiries", json=payload, timeout=20)
    assert response.status_code == 400


def test_booking_enquiry_invalid_slot_returns_400(client):
    payload = {
        "event_id": "e1",
        "name": "Test Shopper",
        "phone": "9876543210",
        "date": (date.today() + timedelta(days=1)).isoformat(),
        "slot": "01:11 AM",
        "guests": 2,
    }
    response = client.post(f"{API}/booking-enquiries", json=payload, timeout=20)
    assert response.status_code == 400


def test_booking_enquiry_past_date_returns_400(client):
    payload = {
        "event_id": "e1",
        "name": "Test Shopper",
        "phone": "9876543210",
        "date": (date.today() - timedelta(days=1)).isoformat(),
        "slot": "11:00 AM",
        "guests": 2,
    }
    response = client.post(f"{API}/booking-enquiries", json=payload, timeout=20)
    assert response.status_code == 400


def test_booking_enquiry_invalid_phone_returns_422(client):
    payload = {
        "event_id": "e1",
        "name": "Test Shopper",
        "phone": "12345",
        "date": (date.today() + timedelta(days=1)).isoformat(),
        "slot": "11:00 AM",
        "guests": 2,
    }
    response = client.post(f"{API}/booking-enquiries", json=payload, timeout=20)
    assert response.status_code == 422


def test_booking_enquiry_guest_limits(client):
    low = {
        "event_id": "e1",
        "name": "Test Shopper",
        "phone": "9876543210",
        "date": (date.today() + timedelta(days=1)).isoformat(),
        "slot": "11:00 AM",
        "guests": 0,
    }
    high = {**low, "guests": 9}
    low_response = client.post(f"{API}/booking-enquiries", json=low, timeout=20)
    high_response = client.post(f"{API}/booking-enquiries", json=high, timeout=20)
    assert low_response.status_code == 422
    assert high_response.status_code == 422


# ---------- Cart-related coupons/orders ----------
def test_coupon_threshold_response_for_fresh50(client):
    low = client.post(f"{API}/coupons/apply", json={"code": "FRESH50", "subtotal": 150}, timeout=20)
    ok = client.post(f"{API}/coupons/apply", json={"code": "FRESH50", "subtotal": 250}, timeout=20)
    assert low.status_code == 200 and low.json()["ok"] is False
    assert ok.status_code == 200 and ok.json()["discount"] == 50


def test_create_order_and_verify_with_get(client):
    payload = {
        "items": [
            {
                "id": "f1",
                "name": "Classic Cheeseburger",
                "weight": "McDonald’s · 1 burger",
                "price": 129,
                "mrp": 159,
                "image": "/api/media/burger",
                "qty": 2,
            }
        ],
        "subtotal": 258,
        "discount": 26,
        "delivery_fee": 0,
        "total": 232,
        "coupon_code": "LATUR10",
    }
    create_response = client.post(f"{API}/orders", json=payload, timeout=20)
    assert create_response.status_code == 200
    created = create_response.json()
    get_response = client.get(f"{API}/orders/{created['id']}", timeout=20)
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["total"] == 232
    assert fetched["coupon_code"] == "LATUR10"
