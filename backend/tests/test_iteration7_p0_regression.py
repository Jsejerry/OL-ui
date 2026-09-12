"""Iteration 7 P0 regression tests: media integrity + themed catalog + assistant budget constraints."""

import json
import os
from io import BytesIO
from urllib.parse import urlparse

import pytest
import requests
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError


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


def _extract_media_id(url: str) -> str | None:
    if not isinstance(url, str) or '/api/media/' not in url:
        return None
    return url.rsplit('/api/media/', 1)[-1].split('?', 1)[0].strip()


def _decode_image(content: bytes):
    img = Image.open(BytesIO(content))
    img.verify()


def _stream_done_event(response: requests.Response) -> dict:
    events = []
    for line in response.iter_lines(decode_unicode=True):
        if not line:
            continue
        events.append(json.loads(line))
    assert events, 'Expected NDJSON events from assistant stream'
    done = [e for e in events if e.get('type') == 'done']
    assert len(done) == 1, f'Expected one done event, got: {events}'
    return done[0]


# ---------- Catalog/store/banner media audit ----------
def test_catalog_shape_and_counts(client):
    response = client.get(f'{API}/catalog', timeout=40)
    assert response.status_code == 200
    data = response.json()

    assert len(data.get('brands', [])) == 46
    assert len(data.get('products', [])) == 84
    assert len(data.get('categories', [])) == 32
    assert len(data.get('themed_stores', [])) == 5


def test_media_urls_decode_or_play_and_report_failures(client):
    catalog = client.get(f'{API}/catalog', timeout=40).json()
    stores = client.get(f'{API}/stores', timeout=40).json()
    banners = client.get(f'{API}/banners', timeout=40).json()
    reels = client.get(f'{API}/reels', timeout=40).json()

    managed_ids = set()
    image_urls = set()
    video_urls = set()

    # module: catalog assets and themed store images
    for item in catalog.get('categories', []):
        if item.get('image'):
            image_urls.add(item['image'])
    for item in catalog.get('products', []):
        if item.get('image'):
            image_urls.add(item['image'])
    for item in catalog.get('brands', []):
        for key in ('logo', 'image'):
            if item.get(key):
                image_urls.add(item[key])
    for item in catalog.get('themed_stores', []):
        if item.get('image'):
            image_urls.add(item['image'])

    # module: stores and store media
    for store in stores:
        if store.get('logo'):
            image_urls.add(store['logo'])
        for media in store.get('media', []):
            if media.get('thumbnail'):
                image_urls.add(media['thumbnail'])
            if media.get('type') == 'image' and media.get('url'):
                image_urls.add(media['url'])
            if media.get('type') == 'video' and media.get('url'):
                video_urls.add(media['url'])
            if media.get('video_web'):
                video_urls.add(media['video_web'])

    # module: banners and reels
    for banner in banners:
        if banner.get('image'):
            image_urls.add(banner['image'])
    for reel in reels:
        for key in ('thumbnail', 'video'):
            if reel.get(key):
                if key == 'thumbnail':
                    image_urls.add(reel[key])
                else:
                    video_urls.add(reel[key])
        if reel.get('video_web'):
            video_urls.add(reel['video_web'])

    # explicit keys called out by request
    explicit_media_ids = {
        'city-logo',
        'icon-food-v2', 'icon-grocery-v2', 'icon-shops-v2', 'icon-care-v2', 'icon-book-it-v2',
        'vendor-veggies-v2', 'vendor-dairy-v2', 'vendor-food-v2', 'vendor-care-v2', 'vendor-shops-v2',
        'store-festive', 'store-fitness', 'store-trending', 'store-gourmet', 'store-everyday',
        'reel-burger', 'reel-tomato', 'reel-pasta', 'reel-burger-webm', 'reel-tomato-webm', 'reel-pasta-webm',
    }

    for url in image_urls.union(video_urls):
        key = _extract_media_id(url)
        if key:
            managed_ids.add(key)

    managed_ids.update(explicit_media_ids)

    broken_images = []
    broken_videos = []

    # Validate managed /api/media IDs first (decode + non-empty)
    for media_id in sorted(managed_ids):
        try:
            response = client.get(f'{API}/media/{media_id}', timeout=40)
        except requests.RequestException:
            broken_images.append({'id': media_id, 'url': f'{API}/media/{media_id}', 'status': 'request-failed'})
            continue
        if response.status_code != 200:
            broken_images.append({'id': media_id, 'url': f'{API}/media/{media_id}', 'status': response.status_code})
            continue
        if not response.content:
            broken_images.append({'id': media_id, 'url': f'{API}/media/{media_id}', 'status': 'empty'})
            continue
        content_type = response.headers.get('content-type', '')
        if content_type.startswith('image/'):
            try:
                _decode_image(response.content)
            except (UnidentifiedImageError, OSError):
                broken_images.append({'id': media_id, 'url': f'{API}/media/{media_id}', 'status': 'decode-failed'})
        elif 'video' in content_type:
            if len(response.content) < 2048:
                broken_videos.append({'id': media_id, 'url': f'{API}/media/{media_id}', 'status': 'too-small'})

    # Validate external HTTP(S) URLs that still appear in payloads
    external_urls = [u for u in image_urls.union(video_urls) if isinstance(u, str) and u.startswith('http') and '/api/media/' not in u]
    for url in sorted(set(external_urls)):
        try:
            response = client.get(url, timeout=40)
        except requests.RequestException:
            broken_images.append({'id': '', 'url': url, 'status': 'request-failed'})
            continue
        if response.status_code != 200 or not response.content:
            broken_images.append({'id': '', 'url': url, 'status': response.status_code})
            continue
        content_type = response.headers.get('content-type', '')
        if content_type.startswith('image/'):
            try:
                _decode_image(response.content)
            except (UnidentifiedImageError, OSError):
                broken_images.append({'id': '', 'url': url, 'status': 'decode-failed'})
        elif 'video' in content_type and len(response.content) < 2048:
            broken_videos.append({'id': '', 'url': url, 'status': 'too-small'})

    assert broken_images == [], f'Broken/undecodable images found: {broken_images}'
    assert broken_videos == [], f'Broken/empty videos found: {broken_videos}'


# ---------- Assistant budget + vegetarian + cart context ----------
def test_assistant_budget_vegetarian_and_cart_subtotal_298(client):
    created = client.post(f'{API}/assistant/sessions', json={}, timeout=20)
    assert created.status_code == 200
    sid = created.json()['id']

    response = client.post(
        f'{API}/assistant/chat',
        json={
            'session_id': sid,
            'message': 'Give vegetarian recommendations under 300 and review my current cart subtotal.',
            'budget': 300,
            'preference': 'vegetarian',
            'cart_items': [{'id': 'sf1', 'qty': 2}],
        },
        stream=True,
        timeout=130,
    )
    assert response.status_code == 200, response.text
    done = _stream_done_event(response)

    assert done.get('budget') == 300
    assert done.get('preference') == 'vegetarian'
    assert done.get('cart_subtotal') == 298
    assert done.get('basket_total', 0) <= 300
    ids = done.get('product_ids', [])
    assert isinstance(ids, list)

    products = client.get(f'{API}/products', timeout=30).json()
    by_id = {p['id']: p for p in products}
    restricted = {'chicken', 'meat', 'fish', 'egg', 'burger', 'whopper'}
    for pid in ids:
        assert pid in by_id
        name = by_id[pid]['name'].lower()
        assert not any(word in name for word in restricted), f'Non-vegetarian item returned: {pid} {name}'


def test_five_store_collections_present(client):
    data = client.get(f'{API}/catalog', timeout=30).json()
    stores = data.get('themed_stores', [])
    ids = {store['id'] for store in stores}
    assert ids == {'festive', 'fitness', 'trending', 'gourmet', 'everyday'}
    for store in stores:
        assert isinstance(store.get('categories'), list) and len(store['categories']) >= 4
        assert _extract_media_id(store.get('image', '')) is not None
