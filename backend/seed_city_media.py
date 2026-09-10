"""Curated OneCity media import; generated motion ads are explicitly sample brand ads."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import os
import subprocess
import tempfile
import uuid
import requests
from PIL import Image, ImageDraw, ImageChops
from pymongo import MongoClient
import cairosvg
import imageio_ffmpeg
from media_store import put_object, get_object

db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
SOURCES = {
    'city-logo': 'https://customer-assets-gfyr7b9c.emergentagent.net/job_onelatur-market/artifacts/k8kt9vac_hf_20260909_210048_132cb1e9-7487-46a6-87fb-4df954f897d2.webp',
    'amul-logo': 'https://amul.com/header/logo.svg',
    'amul-cheese': 'https://www.bbassets.com/media/uploads/p/l/104582_8-amul-cheese-slices.jpg',
    'amul-butter-pack': 'https://dudhsagardairy.coop/wp-content/uploads/2025/11/Amul-Butter.jpg',
    'amul-float': 'https://static.prod-images.emergentagent.com/jobs/db4fdb48-b6e5-4ee7-b438-ee61f170c5f1/images/ea6d1390bb68979c051f5c1b0c762a256cd698ead81303c59206a972a99045bd.jpeg',
    'amul-milk': 'https://cdn.zeptonow.com/production/ik-seo/tr:w-640,ar-1200-1200,pr-true,f-auto,q-80/cms/product_variant/7aecef2d-80ab-406d-8f44-bea711b845ae/Amul-Taaza-Homogenised-Toned-Milk-Tetra-Pack-.jpeg',
    'amul-cream': 'https://www.bbassets.com/media/uploads/p/l/104615_9-amul-fresh-cream.jpg',
    'nike-logo': 'https://cdn.simpleicons.org/nike/111111',
    'boat-logo': 'https://cdn.simpleicons.org/boat/111111',
    'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85',
    'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85',
    'lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85',
    'tshirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85',
}


def store(key, content, mime, ext):
    result = put_object(f'onecity/catalog/{uuid.uuid4()}.{ext}', content, mime)
    db.catalog_assets.update_one({'id': key}, {'$set': {'id': key, 'storage_path': result['path'], 'content_type': mime}}, upsert=True)


def import_image(entry):
    key, url = entry
    if db.catalog_assets.find_one({'id': key}):
        return
    try:
        if 'amul.com' in url:
            data = subprocess.run(['curl', '-fLsS', '--max-time', '60', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', url], capture_output=True, check=True).stdout
        else:
            r = requests.get(url, timeout=45)
            r.raise_for_status()
            data = r.content
        if 'svg' in url or b'<svg' in data[:1000]:
            data = cairosvg.svg2png(bytestring=data, output_width=600)
        im = Image.open(BytesIO(data)).convert('RGBA')
        if key == 'city-logo':
            gray = im.convert('L')
            alpha = gray.point(lambda p: max(0, min(255, (130-p)*4)))
            im = Image.new('RGBA', im.size, (0, 0, 0, 0))
            im.putalpha(alpha)
            im = im.crop(alpha.getbbox())
        im.thumbnail((900, 1000))
        if key == 'amul-float':
            mask = ImageChops.darker(ImageChops.darker(im.getchannel('R'), im.getchannel('G')), im.getchannel('B')).point(lambda p: 255 if p > 175 else 0)
            for point in [(0, 0), (mask.width-1, 0), (0, mask.height-1), (mask.width-1, mask.height-1)]:
                if mask.getpixel(point) == 255:
                    ImageDraw.floodfill(mask, point, 128)
            im.putalpha(mask.point(lambda p: 0 if p == 128 else 255))
            im = im.crop(im.getbbox())
        buff = BytesIO()
        im.save(buff, 'PNG')
        store(key, buff.getvalue(), 'image/png', 'png')
        if key == 'amul-cheese':
            # Remove only edge-connected white background; preserve white areas within the pack.
            white = ImageChops.darker(ImageChops.darker(im.getchannel('R'), im.getchannel('G')), im.getchannel('B')).point(lambda p: 255 if p > 239 else 0)
            for point in [(0, 0), (white.width-1, 0), (0, white.height-1), (white.width-1, white.height-1)]:
                if white.getpixel(point) == 255:
                    ImageDraw.floodfill(white, point, 128)
            im.putalpha(white.point(lambda p: 0 if p == 128 else 255))
            im = im.crop(im.getbbox())
            out = BytesIO(); im.save(out, 'PNG'); store('amul-cutout', out.getvalue(), 'image/png', 'png')
        print('IMPORTED', key, flush=True)
    except Exception as exc:
        print('FAILED', key, str(exc), flush=True)


def motion_reel(key, photo, background):
    if db.catalog_assets.find_one({'id': key + '-webm'}):
        return
    source = db.catalog_assets.find_one({'id': photo}, {'_id': 0})
    data, _ = get_object(source['storage_path'])
    with tempfile.TemporaryDirectory() as folder:
        frame = Image.new('RGB', (540, 960), background)
        draw = ImageDraw.Draw(frame)
        draw.ellipse((-100, 70, 690, 780), fill='#ffffff')
        product = Image.open(BytesIO(data)).convert('RGBA')
        product.thumbnail((430, 520))
        frame.paste(product, ((540-product.width)//2, 170+(520-product.height)//2), product)
        png = Path(folder) / 'frame.png'; frame.save(png)
        for suffix, codec in [('mp4', 'libx264'), ('webm', 'libvpx-vp9')]:
            target = Path(folder) / ('ad.' + suffix)
            subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loop', '1', '-i', str(png), '-vf', "zoompan=z='min(zoom+0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=200:s=540x960:fps=25", '-t', '8', '-c:v', codec, '-pix_fmt', 'yuv420p', '-an', str(target)], check=True, capture_output=True)
            store(key if suffix == 'mp4' else key + '-webm', target.read_bytes(), 'video/' + suffix, suffix)
    print('CREATED SAMPLE AD', key, flush=True)


if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=5) as executor:
        list(executor.map(import_image, SOURCES.items()))
    motion_reel('reel-amul-v2', 'amul-float', '#B4EF85')
    motion_reel('reel-nivea', 'skincare', '#DAD4FC')