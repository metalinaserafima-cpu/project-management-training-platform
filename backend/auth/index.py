import json
import os
import hashlib
import hmac
import base64
import time
import re
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
    'Access-Control-Max-Age': '86400',
}


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: str = None) -> str:
    if salt is None:
        salt = base64.urlsafe_b64encode(os.urandom(16)).decode()
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, _ = stored.split('$', 1)
        candidate = hash_password(password, salt)
        return hmac.compare_digest(candidate, stored)
    except Exception:
        return False


def make_token(payload: dict, secret: str, ttl_seconds: int = 60 * 60 * 24 * 30) -> str:
    header = {'alg': 'HS256', 'typ': 'JWT'}
    payload = dict(payload)
    payload['exp'] = int(time.time()) + ttl_seconds
    segments = [
        _b64url_encode(json.dumps(header).encode()),
        _b64url_encode(json.dumps(payload).encode()),
    ]
    signing_input = '.'.join(segments).encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    segments.append(_b64url_encode(signature))
    return '.'.join(segments)


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


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Регистрация, вход и проверка токена пользователей платформы (студент/преподаватель)"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    secret = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    if method == 'POST' and action == 'register':
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        role = body.get('role') or 'student'

        if role not in ('student', 'teacher'):
            role = 'student'
        if not name or len(name) < 2:
            return _resp(400, {'error': 'Введите имя (минимум 2 символа)'})
        if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
            return _resp(400, {'error': 'Введите корректный email'})
        if len(password) < 6:
            return _resp(400, {'error': 'Пароль должен быть не менее 6 символов'})

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s" % _sql_str(email))
        if cur.fetchone():
            cur.close()
            conn.close()
            return _resp(409, {'error': 'Пользователь с таким email уже существует'})

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id, name, email, role"
            % (_sql_str(name), _sql_str(email), _sql_str(pwd_hash), _sql_str(role))
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        user = {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3]}
        token = make_token({'uid': user['id'], 'role': user['role']}, secret)
        return _resp(200, {'user': user, 'token': token})

    if method == 'POST' and action == 'login':
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = %s" % _sql_str(email)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row or not verify_password(password, row[3]):
            return _resp(401, {'error': 'Неверный email или пароль'})

        user = {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[4]}
        token = make_token({'uid': user['id'], 'role': user['role']}, secret)
        return _resp(200, {'user': user, 'token': token})

    if method == 'GET' and action == 'me':
        auth_header = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('x-authorization') or ''
        token = auth_header.replace('Bearer ', '').strip()
        payload = verify_token(token, secret)
        if not payload:
            return _resp(401, {'error': 'Требуется авторизация'})

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role FROM users WHERE id = %s" % int(payload['uid']))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return _resp(401, {'error': 'Пользователь не найден'})

        user = {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3]}
        return _resp(200, {'user': user})

    return _resp(400, {'error': 'Неизвестное действие'})


def _sql_str(value: str) -> str:
    escaped = value.replace("'", "''")
    return f"'{escaped}'"


def _resp(status: int, data: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }
