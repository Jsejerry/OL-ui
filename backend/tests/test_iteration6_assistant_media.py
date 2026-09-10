"""Iteration 6 focused tests: assistant session/chat NDJSON and managed v2 media keys."""

import json
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


def _chat_stream(client: requests.Session, session_id: str, message: str):
    response = client.post(
        f'{API}/assistant/chat',
        json={'session_id': session_id, 'message': message},
        stream=True,
        timeout=130,
    )
    assert response.status_code == 200, response.text
    assert 'application/x-ndjson' in response.headers.get('content-type', '')

    events = []
    for line in response.iter_lines(decode_unicode=True):
        if not line:
            continue
        events.append(json.loads(line))
    assert events, 'Expected NDJSON events'
    return events


# ---------- Assistant session + streaming chat ----------
def test_create_session(client):
    response = client.post(f'{API}/assistant/sessions', json={}, timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get('id'), str) and data['id']
    assert data.get('messages') == []


def test_chat_streams_and_returns_product_ids_and_links(client):
    session = client.post(f'{API}/assistant/sessions', json={}, timeout=20).json()
    events = _chat_stream(
        client,
        session['id'],
        'I am going to gym for bulking, suggest meal ideas and products from your catalogue.',
    )

    done = [e for e in events if e.get('type') == 'done']
    assert len(done) == 1
    payload = done[0]
    assert isinstance(payload.get('text'), str) and payload['text'].strip()
    assert isinstance(payload.get('product_ids'), list)
    assert isinstance(payload.get('search_links'), list)
    assert payload.get('live_prices_available') is False


def test_second_turn_and_get_session_without_mongo_id(client):
    created = client.post(f'{API}/assistant/sessions', json={}, timeout=20).json()
    sid = created['id']
    _chat_stream(client, sid, 'Help me with a bulking day under budget using your products.')
    _chat_stream(client, sid, 'I prefer vegetarian options in this plan.')

    saved = client.get(f'{API}/assistant/sessions/{sid}', timeout=20)
    assert saved.status_code == 200
    data = saved.json()
    assert '_id' not in data
    assert data['id'] == sid
    assert len(data.get('messages', [])) >= 4
    last_assistant = [m for m in data['messages'] if m.get('role') == 'assistant'][-1]
    assert isinstance(last_assistant.get('text'), str) and last_assistant['text'].strip()


def test_chat_blank_message_validation(client):
    created = client.post(f'{API}/assistant/sessions', json={}, timeout=20).json()
    response = client.post(
        f'{API}/assistant/chat',
        json={'session_id': created['id'], 'message': '   '},
        timeout=20,
    )
    assert response.status_code == 422


def test_chat_unknown_session_returns_404(client):
    response = client.post(
        f'{API}/assistant/chat',
        json={'session_id': 'd9f6e7c3-6f94-41b2-8ab0-ef44d9911111', 'message': 'hello'},
        timeout=20,
    )
    assert response.status_code == 404


# ---------- Managed media v2 keys ----------
@pytest.mark.parametrize(
    'key',
    [
        'icon-food-v2',
        'icon-grocery-v2',
        'icon-shops-v2',
        'icon-care-v2',
        'icon-book-it-v2',
        'vendor-veggies-v2',
        'vendor-dairy-v2',
        'vendor-food-v2',
        'vendor-care-v2',
        'vendor-shops-v2',
    ],
)
def test_motion_media_v2_keys_resolve(client, key):
    response = client.get(f'{API}/media/{key}', timeout=20)
    assert response.status_code == 200
    assert response.headers.get('content-type', '').startswith('image/')
