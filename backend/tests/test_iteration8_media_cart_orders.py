"""Iteration 8 regression: media restoration and order image canonicalization."""

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
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})
    return session


# module: store media restoration after legacy external URL replacement
def test_store_s3_second_thumbnail_is_managed_media(client):
    response = client.get(f'{API}/stores/s3', timeout=30)
    assert response.status_code == 200
    payload = response.json()

    assert len(payload['media']) >= 2
    assert payload['media'][1]['thumbnail'] == '/api/media/snacks'


# module: catalogue sample products now resolved to managed media URLs
def test_target_products_use_managed_media(client):
    response = client.get(f'{API}/products', timeout=30)
    assert response.status_code == 200
    products = response.json()
    by_id = {p['id']: p for p in products}

    for pid in ('p2', 'p7', 'p14', 'a2'):
        assert pid in by_id
        assert '/api/media/' in by_id[pid]['image']


# module: orders list/detail canonicalize stale images while keeping quantity and price values
def test_order_get_endpoints_canonicalize_images_without_qty_price_mutation(client):
    products = client.get(f'{API}/products', timeout=30).json()
    target = next(p for p in products if p['id'] == 'p2')

    create_payload = {
        'items': [{
            'id': target['id'],
            'name': target['name'],
            'weight': target['weight'],
            'price': target['price'],
            'mrp': target['mrp'],
            'image': 'https://example.com/stale-external-image.jpg',
            'qty': 3,
        }],
        'subtotal': target['price'] * 3,
        'discount': 0,
        'delivery_fee': 0,
        'total': target['price'] * 3,
        'coupon_code': None,
    }

    created = client.post(f'{API}/orders', json=create_payload, timeout=30)
    assert created.status_code == 200
    order_id = created.json()['id']

    detail = client.get(f'{API}/orders/{order_id}', timeout=30)
    assert detail.status_code == 200
    detail_item = detail.json()['items'][0]

    assert detail_item['image'] == target['image']
    assert detail_item['qty'] == 3
    assert detail_item['price'] == target['price']

    listed = client.get(f'{API}/orders', timeout=30)
    assert listed.status_code == 200
    listed_order = next(o for o in listed.json() if o['id'] == order_id)
    listed_item = listed_order['items'][0]

    assert listed_item['image'] == target['image']
    assert listed_item['qty'] == 3
    assert listed_item['price'] == target['price']
