import json
import os
import base64
import uuid
import hashlib
import hmac
import time
import boto3

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_TYPES = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
}

MAX_SIZE_BYTES = 5 * 1024 * 1024


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def verify_token(token: str, secret: str):
    try:
        header_b64, payload_b64, sig_b64 = token.split('.')
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64))
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def handler(event: dict, context) -> dict:
    """Загрузка изображения (base64) в S3 и получение публичной CDN-ссылки"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'POST':
        return _resp(405, {'error': 'Метод не поддерживается'})

    secret = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
    headers = event.get('headers', {}) or {}
    auth_header = headers.get('X-Authorization') or headers.get('x-authorization') or ''
    token = auth_header.replace('Bearer ', '').strip()
    if not token or not verify_token(token, secret):
        return _resp(401, {'error': 'Требуется авторизация'})

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw)
    except Exception:
        return _resp(400, {'error': 'Некорректный формат запроса'})

    image_data = body.get('image') or ''
    content_type = body.get('content_type') or 'image/png'

    if content_type not in ALLOWED_TYPES:
        return _resp(400, {'error': 'Недопустимый формат изображения'})

    if ',' in image_data:
        image_data = image_data.split(',', 1)[1]

    try:
        raw_bytes = base64.b64decode(image_data)
    except Exception:
        return _resp(400, {'error': 'Не удалось декодировать изображение'})

    if len(raw_bytes) > MAX_SIZE_BYTES:
        return _resp(400, {'error': 'Файл слишком большой (максимум 5 МБ)'})

    ext = ALLOWED_TYPES[content_type]
    key = f"persona-avatars/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=raw_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return _resp(200, {'url': cdn_url})


def _resp(status: int, data: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }
