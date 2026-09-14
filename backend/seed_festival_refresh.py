"""Import generated festival characters with edge-connected white removal."""
from collections import deque
from io import BytesIO
import os
from pathlib import Path
import uuid
import requests
import numpy as np
from PIL import Image
from pymongo import MongoClient
from dotenv import load_dotenv
from media_store import put_object, get_object

load_dotenv(Path(__file__).parent / '.env')
ASSETS = {
    'float-headphones-v2': 'https://static.prod-images.emergentagent.com/jobs/be9811b2-819b-439d-9d05-ad1b72aaab9d/images/01ce17f0ec3e2ec2d0d70ef691dadeca9fc0ba76cb6c71ac55191b081dabc3d8.jpeg',
    'float-sneaker-v2': 'https://static.prod-images.emergentagent.com/jobs/be9811b2-819b-439d-9d05-ad1b72aaab9d/images/681173074e3ee1c9133dd8ef0bbe3eb20cd7675ad4deb8e96811b046fb8f13b2.jpeg',
    'festival-bappa': 'https://static.prod-images.emergentagent.com/jobs/be9811b2-819b-439d-9d05-ad1b72aaab9d/images/444961d3024a396d58daaa196ce8226a9e9f175078a8d5d112d12253fee1e880.jpeg',
    'festival-navratri': 'https://static.prod-images.emergentagent.com/jobs/be9811b2-819b-439d-9d05-ad1b72aaab9d/images/32d790f7fbbf0ac2427b4fe90413d9b718f70339e8c835c690d03821e418530d.jpeg',
}


def cutout(im, clear_white_holes=False):
    im = im.convert('RGBA')
    im.thumbnail((700, 700))
    pixels = np.array(im)
    white = np.min(pixels[:, :, :3], axis=2) > 234
    height, width = white.shape
    seen = np.zeros_like(white)
    queue = deque([(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)] + [(y, 0) for y in range(height)] + [(y, width - 1) for y in range(height)])
    while queue:
        y, x = queue.popleft()
        if y < 0 or x < 0 or y >= height or x >= width or seen[y, x] or not white[y, x]:
            continue
        seen[y, x] = True
        queue.extend([(y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)])
    pixels[seen, 3] = 0
    if clear_white_holes:
        pixels[white, 3] = 0
    result = Image.fromarray(pixels)
    bbox = result.getbbox()
    return result.crop(bbox) if bbox else result


if __name__ == '__main__':
    db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
    for key, source in ASSETS.items():
        if db.catalog_assets.find_one({'id': key}, {'_id': 0}):
            continue
        response = requests.get(source, timeout=90)
        response.raise_for_status()
        im = cutout(Image.open(BytesIO(response.content)), clear_white_holes=key == 'float-headphones-v2')
        out = BytesIO()
        im.save(out, 'WEBP', quality=93)
        stored = put_object(f'onecity/uploads/catalog/{uuid.uuid4()}.webp', out.getvalue(), 'image/webp')
        db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': stored['path'], 'content_type': 'image/webp'}}, upsert=True)
        print('Imported', key, flush=True)
    for source_key in ['item-sweets', 'item-diya', 'item-marigold', 'item-dandiya', 'item-dumbbell', 'item-yoga', 'item-protein', 'headphones', 'sneakers', 'item-chocolate', 'item-coffee-jar', 'item-nuts', 'amul-milk', 'item-rice', 'item-detergent']:
        key = 'float-' + source_key
        if db.catalog_assets.find_one({'id': key}, {'_id': 0}):
            continue
        source = db.catalog_assets.find_one({'id': source_key}, {'_id': 0})
        if not source:
            raise RuntimeError(f'Missing source {source_key}')
        content, _ = get_object(source['storage_path'])
        out = BytesIO()
        cutout(Image.open(BytesIO(content))).save(out, 'WEBP', quality=90)
        stored = put_object(f'onecity/uploads/catalog/{uuid.uuid4()}.webp', out.getvalue(), 'image/webp')
        db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': stored['path'], 'content_type': 'image/webp'}}, upsert=True)
        print('Imported', key, flush=True)