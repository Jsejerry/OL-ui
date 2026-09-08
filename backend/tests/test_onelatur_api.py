"""One Latur backend API tests - all endpoints"""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://onelatur-market.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- health ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- categories ----------
class TestCategories:
    def test_categories_ok(self, client):
        r = client.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 8
        keys = {"id", "name", "emoji", "color"}
        for c in data:
            assert keys.issubset(c.keys())
            assert "_id" not in c


# ---------- discover ----------
class TestDiscover:
    def test_discover_ok(self, client):
        r = client.get(f"{API}/discover")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 8
        labels = {d["label"] for d in data}
        expected = {"Trending", "New", "Fresh", "Bestseller", "Under ₹99", "Local", "Organic", "Combo"}
        assert expected.issubset(labels)


# ---------- banners ----------
class TestBanners:
    def test_banners_ok(self, client):
        r = client.get(f"{API}/banners")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 3
        for b in data:
            for k in ("id", "title", "subtitle", "image", "bg"):
                assert k in b
            assert "_id" not in b


# ---------- stores ----------
class TestStores:
    def test_list_stores(self, client):
        r = client.get(f"{API}/stores")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 3
        assert any(s["id"] == "s1" and s["name"] == "Latur Fresh Mart" for s in data)

    def test_get_store_s1(self, client):
        r = client.get(f"{API}/stores/s1")
        assert r.status_code == 200
        s = r.json()
        assert s["name"] == "Latur Fresh Mart"
        assert len(s["media"]) == 4
        # 2 videos + 2 images required by spec
        videos = [m for m in s["media"] if m["type"] == "video"]
        images = [m for m in s["media"] if m["type"] == "image"]
        assert len(videos) == 2
        assert len(images) == 2

    def test_get_store_404(self, client):
        r = client.get(f"{API}/stores/does-not-exist")
        assert r.status_code == 404

    def test_store_products(self, client):
        r = client.get(f"{API}/stores/s1/products")
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) > 0
        assert all(p["store_id"] == "s1" for p in prods)


# ---------- products ----------
class TestProducts:
    def test_all_products(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 16
        for p in data:
            for k in ("id", "name", "price", "mrp", "image", "category_id", "store_id"):
                assert k in p
            assert "_id" not in p

    def test_products_filter_by_category(self, client):
        r = client.get(f"{API}/products", params={"category_id": "c1"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["category_id"] == "c1" for p in data)

    def test_buy_again(self, client):
        r = client.get(f"{API}/products/buy-again")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 5
        ids = {p["id"] for p in data}
        assert ids == {"p4", "p6", "p8", "p11", "p16"}

    def test_get_product_p1(self, client):
        r = client.get(f"{API}/products/p1")
        assert r.status_code == 200
        p = r.json()
        assert p["name"] == "Fresh Tomatoes"
        assert p["price"] == 25

    def test_get_product_404(self, client):
        r = client.get(f"{API}/products/zzz")
        assert r.status_code == 404
