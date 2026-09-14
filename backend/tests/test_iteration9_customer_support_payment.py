"""Iteration 9 regression: payment metadata, support receipts, and order compatibility."""

import os
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv(Path(__file__).resolve().parents[2] / 'frontend' / '.env')

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    pytest.fail('EXPO_PUBLIC_BACKEND_URL is required for API tests', pytrace=False)

BASE_URL = BASE_URL.rstrip('/')
API = f'{BASE_URL}/api'

load_dotenv(Path(__file__).resolve().parents[1] / '.env')
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')


@pytest.fixture(scope='module')
def client():
    """Shared API client."""
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})
    return session


@pytest.fixture(scope='module')
def mongo_db():
    """Mongo DB fixture for persistence verification."""
    if not MONGO_URL or not DB_NAME:
        pytest.skip('MONGO_URL or DB_NAME missing; cannot verify persistence')
    mongo_client = MongoClient(MONGO_URL)
    database = mongo_client[DB_NAME]
    yield database
    mongo_client.close()


# module: orders payment method persistence + backwards compatibility
class TestOrderPaymentPersistence:
    def test_create_order_with_card_persists_payment_fields(self, client):
        payload = {
            'items': [{
                'id': 'p1',
                'name': 'Fresh Tomatoes',
                'weight': '500 g',
                'price': 25,
                'mrp': 40,
                'image': 'https://example.com/fake.jpg',
                'qty': 1,
            }],
            'subtotal': 25,
            'discount': 0,
            'delivery_fee': 0,
            'total': 25,
            'coupon_code': None,
            'payment_method': 'card',
        }
        created = client.post(f'{API}/orders', json=payload, timeout=30)
        assert created.status_code == 200
        body = created.json()
        assert body['payment_method'] == 'card'
        assert body['payment_status'] == 'not_charged'

        fetched = client.get(f"{API}/orders/{body['id']}", timeout=30)
        assert fetched.status_code == 200
        fetched_body = fetched.json()
        assert fetched_body['payment_method'] == 'card'
        assert fetched_body['payment_status'] == 'not_charged'

    def test_invalid_payment_method_rejected_with_422(self, client):
        payload = {
            'items': [{
                'id': 'p4',
                'name': 'Amul Milk',
                'weight': '500 ml',
                'price': 28,
                'mrp': 30,
                'image': 'https://example.com/fake.jpg',
                'qty': 1,
            }],
            'subtotal': 28,
            'discount': 0,
            'delivery_fee': 0,
            'total': 28,
            'coupon_code': None,
            'payment_method': 'wallet',
        }
        response = client.post(f'{API}/orders', json=payload, timeout=30)
        assert response.status_code == 422

    def test_order_create_without_payment_method_defaults_to_cod(self, client):
        payload = {
            'items': [{
                'id': 'p6',
                'name': 'Lays Classic',
                'weight': '52 g',
                'price': 20,
                'mrp': 20,
                'image': 'https://example.com/fake.jpg',
                'qty': 2,
            }],
            'subtotal': 40,
            'discount': 0,
            'delivery_fee': 0,
            'total': 40,
            'coupon_code': None,
        }
        created = client.post(f'{API}/orders', json=payload, timeout=30)
        assert created.status_code == 200
        body = created.json()
        assert body['payment_method'] == 'cod'
        assert body['payment_status'] == 'not_charged'


# module: support requests validation + receipt persistence signal
class TestSupportRequests:
    def test_support_request_valid_returns_receipt(self, client, mongo_db):
        payload = {
            'topic': 'order',
            'message': 'TEST_Where is my sample order receipt from today?',
            'reference': 'TEST-ORDER-1234',
        }
        response = client.post(f'{API}/support-requests', json=payload, timeout=30)
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body.get('id'), str) and len(body['id']) > 10
        assert body['status'] == 'saved_for_review'
        assert body.get('created_at')

        saved = mongo_db.support_requests.find_one({'id': body['id']}, {'_id': 0})
        assert saved is not None
        assert saved['topic'] == payload['topic']
        assert saved['message'] == payload['message']
        assert saved['reference'] == payload['reference']

    def test_support_request_short_message_rejected(self, client):
        payload = {
            'topic': 'profile',
            'message': 'too short',
            'reference': 'TEST-SHORT-1',
        }
        response = client.post(f'{API}/support-requests', json=payload, timeout=30)
        assert response.status_code == 422
