"""Import the individual OneCity clay illustrations into managed object storage."""
from io import BytesIO
import os
from pathlib import Path
import requests
from PIL import Image
from pymongo import MongoClient
from dotenv import load_dotenv
from media_store import put_object

load_dotenv(Path(__file__).parent / '.env')
BASE = 'https://static.prod-images.emergentagent.com/jobs/d526bb5e-cc2c-4da4-83b1-dedbcff09095/images/'
ASSETS = {
    'icon-food-v2': '5cd67cccd0a4bb27b65b5328b5cae137ace71a15dea65a242c1a5498b9631f7b',
    'icon-grocery-v2': '116f9e1bf302463e83f3e96f2b7f24130f0e9965874f1540d57e6dd9321f1c8e',
    'icon-shops-v2': '3c2593e781836d134a25668615943ed0d92ae7a6ca325df6ee0ffb5fcb03e6f3',
    'icon-care-v2': 'ceafbd3cfbca54e72f4fdfb24686dd1a6fc627fb3dfb44322cf5fc419d6d9f12',
    'icon-book-it-v2': 'e719a4bda41f2cb893e2bcb3f75522fb504a4d5b475f181fad99678842d19e7f',
    'vendor-veggies-v2': 'ee99f805b505f54dd350325cd4781407dd51860432394d515ce6ec6ba84fec55',
    'vendor-dairy-v2': 'bc7661826b86f2d9de932bf60a27a06702110f5f21359973a53277367394dce3',
    'vendor-food-v2': '69c6306bfb5fe5c97079cfa23e17f0dbe9226f429061a7831a63d99fc3ee903d',
    'vendor-care-v2': '2bf20866d25db8105a08763aae745193df6b071eb1b3789d72693f28e4331d03',
    'vendor-shops-v2': '91735eaa9184a2cc2fce4cdbcac2cd345f33b4f47cdba43ed1b2a27e8fac3812',
}

if __name__ == '__main__':
    db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
    for name, asset in ASSETS.items():
        response = requests.get(BASE + asset + '.jpeg', timeout=60)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert('RGB')
        image.thumbnail((384, 384))
        output = BytesIO()
        image.save(output, 'WEBP', quality=90)
        stored = put_object(f'onecity/motion-v2/{name}.webp', output.getvalue(), 'image/webp')
        db.catalog_assets.update_one({'id': name}, {'$set': {'id': name, 'storage_path': stored['path']}}, upsert=True)
        print(f'Imported {name}', flush=True)