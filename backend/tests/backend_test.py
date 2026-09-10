"""Backend regression tests for One Latur — coupons + orders + core catalog."""
import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / 'frontend' / '.env')
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    pytest.fail('EXPO_PUBLIC_BACKEND_URL is required for API tests', pytrace=False)
BASE_URL = BASE_URL.rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Coupons ----------
class TestCoupons:
    def test_list_coupons_returns_three(self, s):
        r = s.get(f"{API}/coupons", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 3
        codes = {c["code"] for c in data}
        assert codes == {"LATUR10", "FRESH50", "WELCOME"}

    def test_apply_latur10_success(self, s):
        r = s.post(f"{API}/coupons/apply", json={"code": "LATUR10", "subtotal": 150})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True and d["discount"] == 15

    def test_apply_latur10_below_min(self, s):
        r = s.post(f"{API}/coupons/apply", json={"code": "LATUR10", "subtotal": 50})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is False
        assert "49" in d["message"] and "more" in d["message"].lower()

    def test_apply_bad_code(self, s):
        r = s.post(f"{API}/coupons/apply", json={"code": "BAD", "subtotal": 500})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is False and d["message"] == "Invalid coupon code"

    def test_apply_fresh50(self, s):
        r = s.post(f"{API}/coupons/apply", json={"code": "FRESH50", "subtotal": 250})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True and d["discount"] == 50

    def test_apply_welcome(self, s):
        r = s.post(f"{API}/coupons/apply", json={"code": "WELCOME", "subtotal": 25})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True and d["discount"] == 25


# ---------- Orders ----------
class TestOrders:
    order_id = None

    def test_create_order(self, s):
        payload = {
            "items": [
                {"id": "p1", "name": "Fresh Tomatoes", "weight": "500 g", "price": 25, "mrp": 40,
                 "image": "https://x/img.jpg", "qty": 2},
                {"id": "p4", "name": "Amul Milk", "weight": "500 ml", "price": 28, "mrp": 30,
                 "image": "https://x/img.jpg", "qty": 1},
            ],
            "subtotal": 78,
            "discount": 0,
            "delivery_fee": 0,
            "total": 78,
            "coupon_code": None,
        }
        r = s.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("id")
        assert d.get("rider_name")
        assert d.get("eta_minutes") is not None
        assert d.get("status") == "placed"
        assert "_id" not in d
        TestOrders.order_id = d["id"]

    def test_get_order_by_id(self, s):
        assert TestOrders.order_id, "prior create_order must succeed"
        r = s.get(f"{API}/orders/{TestOrders.order_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == TestOrders.order_id
        assert "_id" not in d
        assert d["status"] == "placed"

    def test_list_orders_contains_created(self, s):
        r = s.get(f"{API}/orders")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        for o in arr:
            assert "_id" not in o
        assert any(o["id"] == TestOrders.order_id for o in arr)

    def test_get_order_404(self, s):
        r = s.get(f"{API}/orders/does-not-exist-xyz")
        assert r.status_code == 404


# ---------- Regression: catalog basics ----------
class TestCatalog:
    def test_categories(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200 and len(r.json()) >= 6

    def test_stores(self, s):
        r = s.get(f"{API}/stores")
        assert r.status_code == 200
        stores = r.json()
        assert any(st["id"] == "s1" for st in stores)

    def test_store_s1_media(self, s):
        r = s.get(f"{API}/stores/s1")
        assert r.status_code == 200
        st = r.json()
        vids = [m for m in st["media"] if m["type"] == "video"]
        imgs = [m for m in st["media"] if m["type"] == "image"]
        assert len(vids) == 2 and len(imgs) == 2

    def test_products(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200 and len(r.json()) >= 10

    def test_buy_again(self, s):
        r = s.get(f"{API}/products/buy-again")
        assert r.status_code == 200 and len(r.json()) >= 3
