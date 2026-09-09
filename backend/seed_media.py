"""Idempotent curated media import. Run manually, never on every server start."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import uuid
import subprocess
import requests
from pymongo import MongoClient
from PIL import Image
from media_store import put_object, init_storage
import os

db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
PHOTOS = {
    'fresh': '1542838132-92c53300491e', 'vegetables': '1540420773420-3366772f4999',
    'burger': '1568901346375-23c9450c58cd', 'pizza': '1513104890138-7c749659a591',
    'coffee': '1461023058943-07fcbe16d735', 'chicken': '1562967914-608f82629710',
    'beauty': '1596462502278-27bfdc403348', 'skincare': '1608571423902-eed4a5ad8108',
    'wellness': '1584308666744-24d5c474f2ae', 'milk': '1550583724-b2692b85b150',
    'fruit': '1619566636858-adf3ef46400b', 'bread': '1509440159596-0249088772ff',
    'tomatoes': '1592924357228-91a4daadcfea', 'bananas': '1571771894821-ce9b6c11b08e',
    'eggs': '1587486913049-53fc88980cfc', 'cinema': '1489599849927-2ee91cede3ba',
    'concert': '1470229722913-7c0e2dbbafd3', 'adventure': '1551632811-561732d1e306',
    'fries': '1684815495679-f6e6bc0634ec', 'pasta': '1555949258-eb67b1ef0ceb',
    'snacks': '1621939514649-280e2ee25f60',
}
SOURCES = {key: f'https://images.unsplash.com/photo-{photo}?w=900&q=82&fit=crop' for key, photo in PHOTOS.items()}
SOURCES.update({
    'mcdonalds': 'https://cdn.simpleicons.org/mcdonalds/FFC72C',
    'kfc': 'https://cdn.simpleicons.org/kfc/E4002B',
    'starbucks': 'https://cdn.simpleicons.org/starbucks/00754A',
    'burgerking': 'https://cdn.simpleicons.org/burgerking/D62300',
    'dominos': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Domino%27s_pizza_logo.svg',
    'reel-burger': 'https://videos.pexels.com/video-files/5906565/5906565-sd_640_360_25fps.mp4',
    'reel-tomato': 'https://videos.pexels.com/video-files/6287158/6287158-sd_360_640_25fps.mp4',
    'reel-pasta': 'https://videos.pexels.com/video-files/6286078/6286078-sd_360_640_25fps.mp4',
})


def upload(entry):
    key, url = entry
    if db.catalog_assets.find_one({'id': key}):
        print('EXISTS', key, flush=True)
        return
    try:
        if 'wikimedia.org' in url:
            response = subprocess.run(['curl', '-fLsS', '--max-time', '60', url], capture_output=True, check=True)
            data, content_type = response.stdout, 'image/svg+xml'
        else:
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            data = response.content
            content_type = response.headers.get('Content-Type', '').split(';')[0]
        ext = 'mp4' if key.startswith('reel-') else 'jpg'
        if 'svg' in content_type:
            import cairosvg
            data = cairosvg.svg2png(bytestring=data, output_width=240, output_height=240)
            content_type, ext = 'image/png', 'png'
        elif ext == 'jpg':
            img = Image.open(BytesIO(data)).convert('RGB')
            img.thumbnail((900, 1000))
            buff = BytesIO()
            img.save(buff, format='JPEG', quality=83)
            data, content_type = buff.getvalue(), 'image/jpeg'
        result = put_object(f'onelatur/uploads/catalog/{uuid.uuid4()}.{ext}', data, content_type)
        db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': result['path'], 'source': url, 'content_type': content_type}}, upsert=True)
        print('UPLOADED', key, len(data), flush=True)
    except Exception as exc:
        print('FAILED', key, str(exc), flush=True)


if __name__ == '__main__':
    init_storage()
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(upload, SOURCES.items()))