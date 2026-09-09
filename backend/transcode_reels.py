"""Create browser-compatible VP9 alternatives to native H.264 sample reels."""
import os
import subprocess
import tempfile
import uuid
from pathlib import Path
from pymongo import MongoClient
import imageio_ffmpeg
from media_store import get_object, put_object

db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
for name in ['reel-burger', 'reel-tomato', 'reel-pasta']:
    key = name + '-webm'
    if db.catalog_assets.find_one({'id': key}):
        continue
    source = db.catalog_assets.find_one({'id': name}, {'_id': 0})
    content, _ = get_object(source['storage_path'])
    with tempfile.TemporaryDirectory() as folder:
        mp4, webm = Path(folder) / 'input.mp4', Path(folder) / 'output.webm'
        mp4.write_bytes(content)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-i', str(mp4), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '35', '-an', '-deadline', 'realtime', '-cpu-used', '8', str(webm)], check=True, capture_output=True)
        result = put_object(f'onelatur/uploads/catalog/{uuid.uuid4()}.webm', webm.read_bytes(), 'video/webm')
        db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': result['path'], 'content_type': 'video/webm'}}, upsert=True)
        print('Uploaded browser reel', key, flush=True)