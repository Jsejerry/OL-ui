"""Restoreable, managed illustration imports for the approved demo collections."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import os
import uuid
from pathlib import Path
import requests
from PIL import Image
from pymongo import MongoClient
from dotenv import load_dotenv
from media_store import put_object

load_dotenv(Path(__file__).parent / '.env')
db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
BASE = 'https://static.prod-images.emergentagent.com/jobs/3cb83ea3-18f9-4095-bf39-e30c8fbd8760/images/'
BAGS = {
    'store-festive': 'd16090639c6a9a367d0b30ee5000e70236c0980023254b5a0cf3c19a140b1323',
    'store-fitness': '4606fa22b19307f46123a5884ca3cf6f73b4c176b273dcac6d1ddaf075af58ec',
    'store-trending': '2809fd6667b4ca82ef1d281c25cb78cd0b8ca782606699ee9448336937bad62f',
    'store-gourmet': '692c83fc226038e136d90752feacae65d9b243dcbdaa4d084121beb3dc2f7447',
    'store-everyday': '5062a8d406d0da853885fb1189191d4debc6d3be83eb68cb728080f1e8a541a5',
}
SHEETS = {
    'c620315056485007b91abd3e8877fdc319398d12aaae7eb7b374dd1c06b9735a': ['sweets', 'diya', 'marigold', 'dandiya', 'nuts', 'cereal', 'rice', 'oil', 'chocolate'],
    '7a1e0813a489c8d02a3f50b86ba56ab6f0c402ae97a41223025c54c0b158f01b': ['protein', 'dumbbell', 'yoga', 'badminton', 'coffee-jar', 'detergent', 'bodywash', 'facecream', 'chips'],
}


def save(key, im):
    if db.catalog_assets.find_one({'id': key}, {'_id': 0}):
        return
    im.thumbnail((640, 640))
    out = BytesIO()
    im.save(out, 'WEBP', quality=88)
    stored = put_object(f'onecity/uploads/catalog/{uuid.uuid4()}.webp', out.getvalue(), 'image/webp')
    db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': stored['path'], 'content_type': 'image/webp'}}, upsert=True)
    print('IMPORTED', key, flush=True)


def download(code):
    response = requests.get(BASE + code + '.jpeg', timeout=60)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert('RGB')


if __name__ == '__main__':
    for key, code in BAGS.items():
        save(key, download(code))
    for code, keys in SHEETS.items():
        im = download(code)
        tiles = []
        for i, key in enumerate(keys):
            x, y = i % 3, i // 3
            # Trim sprite borders, preserve white details within each illustration.
            tile = im.crop((round(x*im.width/3)+6, round(y*im.height/3)+6, round((x+1)*im.width/3)-6, round((y+1)*im.height/3)-6))
            tiles.append(('item-' + key, tile))
        with ThreadPoolExecutor(max_workers=3) as pool:
            list(pool.map(lambda pair: save(*pair), tiles))