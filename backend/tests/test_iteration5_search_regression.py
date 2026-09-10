"""Iteration 5 focused regression tests for product search semantics and query filters."""

import os

import pytest
import requests
from dotenv import load_dotenv


load_dotenv('/app/frontend/.env')

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    pytest.fail('EXPO_PUBLIC_BACKEND_URL is required for API tests', pytrace=False)
BASE_URL = BASE_URL.rstrip('/')
API = f'{BASE_URL}/api'


@pytest.fixture(scope='module')
def client():
    return requests.Session()


@pytest.fixture(scope='module')
def catalog(client):
    response = client.get(f'{API}/catalog', timeout=30)
    assert response.status_code == 200
    return response.json()


def _ids(items):
    return {item['id'] for item in items}


# ---------- q filtering semantics ----------
def test_q_care_returns_pharmacy_and_beauty_departments(client):
    response = client.get(f'{API}/products', params={'q': 'care'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    departments = {item['department'] for item in items}
    assert departments.issubset({'pharmacy', 'beauty'})
    assert 'pharmacy' in departments and 'beauty' in departments


def test_q_uppercase_care_behaves_same(client):
    response = client.get(f'{API}/products', params={'q': 'CARE'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    assert {item['department'] for item in items}.issubset({'pharmacy', 'beauty'})


def test_q_shopping_returns_expected_shops_products(client):
    response = client.get(f'{API}/products', params={'q': 'shopping'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 4
    assert all(item['department'] == 'shops' for item in items)


def test_q_amul_cheese_matches_non_contiguous_terms(client):
    response = client.get(f'{API}/products', params={'q': 'Amul cheese'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    ids = _ids(items)
    assert 'a1' in ids and 'a4' in ids


def test_q_dairy_matches_category_name(client):
    response = client.get(f'{API}/products', params={'q': 'dairy'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    assert any(item['id'] == 'a1' for item in items)


def test_q_nike_matches_brand_name(client):
    response = client.get(f'{API}/products', params={'q': 'Nike'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    assert all(item.get('brand_id') for item in items)


def test_q_nonsense_returns_no_results(client):
    response = client.get(f'{API}/products', params={'q': 'zzzzqwerty-nohit'}, timeout=20)
    assert response.status_code == 200
    assert response.json() == []


def test_q_milk_and_pizza_still_work(client):
    milk = client.get(f'{API}/products', params={'q': 'milk'}, timeout=20)
    pizza = client.get(f'{API}/products', params={'q': 'pizza'}, timeout=20)
    assert milk.status_code == 200 and pizza.status_code == 200
    assert len(milk.json()) > 0
    assert len(pizza.json()) > 0


# ---------- department + brand intersections ----------
def test_department_care_unions_pharmacy_and_beauty(client):
    response = client.get(f'{API}/products', params={'department': 'care'}, timeout=20)
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    departments = {item['department'] for item in items}
    assert departments.issubset({'pharmacy', 'beauty'})
    assert 'pharmacy' in departments and 'beauty' in departments


def test_department_and_query_intersect_not_ignored(client):
    no_match = client.get(f'{API}/products', params={'department': 'shops', 'q': 'care'}, timeout=20)
    yes_match = client.get(f'{API}/products', params={'department': 'care', 'q': 'care'}, timeout=20)
    assert no_match.status_code == 200 and yes_match.status_code == 200
    assert no_match.json() == []
    assert len(yes_match.json()) > 0


def test_brand_and_q_combined(client, catalog):
    brands = catalog.get('brands', [])
    amul_brand = next((brand for brand in brands if brand.get('name', '').lower() == 'amul'), None)
    assert amul_brand is not None

    response = client.get(
        f'{API}/products',
        params={'brand_id': amul_brand['id'], 'q': 'cheese'},
        timeout=20,
    )
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    assert all(item.get('brand_id') == amul_brand['id'] for item in items)
