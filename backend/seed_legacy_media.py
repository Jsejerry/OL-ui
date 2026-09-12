"""Preserve remaining legacy photographs in managed storage; safe to rerun."""
from concurrent.futures import ThreadPoolExecutor
from server import LEGACY_MEDIA_SOURCES
from seed_media import upload

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(upload, LEGACY_MEDIA_SOURCES.items()))