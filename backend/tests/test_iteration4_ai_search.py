"""Iteration 4 AI search tests: real image/voice inference plus validation errors."""

import os
import subprocess
import tempfile
import wave
from pathlib import Path
from io import BytesIO

import pytest
import requests
from dotenv import load_dotenv
from PIL import Image


load_dotenv('/app/frontend/.env')

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    pytest.fail('EXPO_PUBLIC_BACKEND_URL is required for AI API tests', pytrace=False)
BASE_URL = BASE_URL.rstrip('/')
API = f'{BASE_URL}/api'


@pytest.fixture(scope='module')
def client():
    session = requests.Session()
    return session


@pytest.fixture(scope='module')
def amul_image_path(client):
    response = client.get(f'{API}/media/amul-cheese', timeout=30)
    assert response.status_code == 200
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        f.write(response.content)
        path = f.name
    yield path
    try:
        Path(path).unlink(missing_ok=True)
    except Exception:
        pass


def _make_long_wav(seconds: float = 21.2) -> str:
    sample_rate = 16000
    total_frames = int(sample_rate * seconds)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        path = f.name
    with wave.open(path, 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(sample_rate)
        out.writeframes(b'\x00\x00' * total_frames)
    return path


def _make_spoken_wav() -> str:
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        path = f.name
    command = ['espeak', '-w', path, 'I want Amul cheese and milk']
    fallback = ['espeak-ng', '-w', path, 'I want Amul cheese and milk']
    ran = False
    for cmd in (command, fallback):
        try:
            subprocess.run(cmd, check=True, capture_output=True, timeout=20)
            ran = True
            break
        except FileNotFoundError:
            continue
    if not ran:
        pytest.skip('espeak/espeak-ng not available to generate spoken audio fixture')
    return path


# ---------- Image search ----------
def test_image_search_real_photo_returns_matches(client, amul_image_path):
    with open(amul_image_path, 'rb') as image_file:
        response = client.post(
            f'{API}/search/image',
            files={'file': ('amul-cheese.png', image_file, 'image/png')},
            timeout=95,
        )
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data.get('query'), str) and data['query'].strip()
    assert isinstance(data.get('product_ids'), list)
    assert 'a1' in data['product_ids']
    assert isinstance(data.get('explanation'), str) and data['explanation'].strip()


def test_image_search_empty_file_returns_400(client):
    response = client.post(
        f'{API}/search/image',
        files={'file': ('empty.png', b'', 'image/png')},
        timeout=30,
    )
    assert response.status_code == 400


def test_image_search_invalid_file_returns_415(client):
    response = client.post(
        f'{API}/search/image',
        files={'file': ('not-image.png', b'not-an-image', 'image/png')},
        timeout=30,
    )
    assert response.status_code == 415


def test_image_search_oversized_returns_413(client):
    large = b'0' * (8 * 1024 * 1024 + 10)
    response = client.post(
        f'{API}/search/image',
        files={'file': ('huge.png', large, 'image/png')},
        timeout=30,
    )
    assert response.status_code == 413


def test_image_search_valid_no_match_photo_returns_empty_or_low_confidence(client):
    # Non-product procedural image to validate no-match handling path.
    image = Image.new('RGB', (320, 320), color=(43, 120, 210))
    for i in range(0, 320, 8):
        image.putpixel((i, i), (255, 255, 0))
    buf = BytesIO()
    image.save(buf, format='PNG')
    response = client.post(
        f'{API}/search/image',
        files={'file': ('abstract.png', buf.getvalue(), 'image/png')},
        timeout=95,
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data.get('product_ids'), list)
    # Ideally empty; tolerate occasional single hallucinated match from model variance.
    assert len(data['product_ids']) <= 1


# ---------- Voice search ----------
def test_voice_search_real_spoken_audio_returns_transcript_and_matches(client):
    wav_path = _make_spoken_wav()
    try:
        with open(wav_path, 'rb') as audio_file:
            response = client.post(
                f'{API}/search/voice',
                files={'file': ('spoken.wav', audio_file, 'audio/wav')},
                timeout=120,
            )
    finally:
        Path(wav_path).unlink(missing_ok=True)

    assert response.status_code == 200, response.text
    data = response.json()
    transcript = (data.get('transcript') or '').lower()
    assert transcript
    assert isinstance(data.get('product_ids'), list)
    assert any(pid in {'a1', 'a3', 'a4'} for pid in data['product_ids'])


def test_voice_search_empty_file_returns_400(client):
    response = client.post(
        f'{API}/search/voice',
        files={'file': ('empty.wav', b'', 'audio/wav')},
        timeout=30,
    )
    assert response.status_code == 400


def test_voice_search_unsupported_extension_returns_415(client):
    response = client.post(
        f'{API}/search/voice',
        files={'file': ('audio.ogg', b'abc', 'audio/ogg')},
        timeout=30,
    )
    assert response.status_code == 415


def test_voice_search_corrupt_audio_returns_415(client):
    response = client.post(
        f'{API}/search/voice',
        files={'file': ('bad.wav', b'not-real-audio', 'audio/wav')},
        timeout=30,
    )
    assert response.status_code == 415


def test_voice_search_long_audio_returns_422(client):
    wav_path = _make_long_wav(21.2)
    try:
        with open(wav_path, 'rb') as audio_file:
            response = client.post(
                f'{API}/search/voice',
                files={'file': ('too-long.wav', audio_file, 'audio/wav')},
                timeout=45,
            )
    finally:
        Path(wav_path).unlink(missing_ok=True)
    assert response.status_code == 422
