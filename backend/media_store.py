"""Public, curated catalogue assets, stored in managed object storage."""
import os
import threading
from pathlib import Path
from functools import lru_cache
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, Response
from starlette.concurrency import run_in_threadpool

load_dotenv(Path(__file__).parent / '.env')
STORAGE_BASE = (os.environ.get('INTEGRATION_PROXY_URL') or '').strip() or 'https://integrations.emergentagent.com'
STORAGE_URL = STORAGE_BASE.rstrip('/') + '/objstore/api/v1/storage'
storage_key = None
lock = threading.Lock()
router = APIRouter(prefix='/api')


def init_storage():
    global storage_key
    with lock:
        if storage_key:
            return storage_key
        response = requests.post(f'{STORAGE_URL}/init', json={'emergent_key': os.environ.get('EMERGENT_LLM_KEY')}, timeout=30)
        response.raise_for_status()
        storage_key = response.json()['storage_key']
        return storage_key


def put_object(path, data, content_type):
    response = requests.put(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': init_storage(), 'Content-Type': content_type}, data=data, timeout=120)
    response.raise_for_status()
    return response.json()


@lru_cache(maxsize=100)
def get_object(path):
    response = requests.get(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': init_storage()}, timeout=60)
    response.raise_for_status()
    return response.content, response.headers.get('Content-Type', 'application/octet-stream')


@router.get('/media/{asset_id}')
async def media(asset_id: str, request: Request):
    # Only allow-listed public catalogue assets, never arbitrary user objects.
    item = await request.app.state.db.catalog_assets.find_one({'id': asset_id}, {'_id': 0})
    if not item or not item.get('storage_path'):
        raise HTTPException(404, 'Image not found')
    try:
        data, content_type = await run_in_threadpool(get_object, item['storage_path'])
    except requests.RequestException as exc:
        raise HTTPException(503, 'Media temporarily unavailable') from exc
    headers = {'Cache-Control': 'public, max-age=86400', 'Accept-Ranges': 'bytes'}
    range_header = request.headers.get('range')
    if range_header and range_header.startswith('bytes='):
        try:
            start, end = range_header[6:].split('-', 1)
            if not start:
                start, end = max(0, len(data) - int(end)), len(data) - 1
            else:
                start, end = int(start), min(int(end), len(data) - 1) if end else len(data) - 1
            if start > end or start >= len(data):
                raise ValueError()
            headers['Content-Range'] = f'bytes {start}-{end}/{len(data)}'
            return Response(data[start:end + 1], status_code=206, media_type=content_type, headers=headers)
        except ValueError:
            return Response(status_code=416, headers={'Content-Range': f'bytes */{len(data)}'})
    return Response(data, media_type=content_type, headers=headers)