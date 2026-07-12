import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
    'Access-Control-Max-Age': '86400',
}


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


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user(event, secret):
    headers = event.get('headers', {}) or {}
    auth_header = headers.get('X-Authorization') or headers.get('x-authorization') or ''
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return None
    return verify_token(token, secret)


def handler(event: dict, context) -> dict:
    """Сохранение, получение и оценивание работ студентов по заданиям курса"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    secret = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
    auth = get_user(event, secret)
    if not auth:
        return _resp(401, {'error': 'Требуется авторизация'})

    uid = int(auth['uid'])
    role = auth.get('role', 'student')

    params = event.get('queryStringParameters') or {}
    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if method == 'GET':
        submission_id = params.get('id')
        task_key = params.get('task_key')

        if submission_id:
            cur.execute(
                """
                SELECT s.*, u.name AS student_name, u.email AS student_email
                FROM submissions s JOIN users u ON u.id = s.user_id
                WHERE s.id = %s
                """ % int(submission_id)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return _resp(404, {'error': 'Работа не найдена'})
            if role != 'teacher' and row['user_id'] != uid:
                return _resp(403, {'error': 'Нет доступа к этой работе'})
            return _resp(200, {'submission': dict(row)})

        if role == 'teacher':
            query = """
                SELECT s.*, u.name AS student_name, u.email AS student_email
                FROM submissions s JOIN users u ON u.id = s.user_id
            """
            if task_key:
                query += " WHERE s.task_key = %s" % _sql_str(task_key)
            query += " ORDER BY s.updated_at DESC"
            cur.execute(query)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return _resp(200, {'submissions': [dict(r) for r in rows]})
        else:
            query = "SELECT * FROM submissions WHERE user_id = %s" % uid
            if task_key:
                query += " AND task_key = %s" % _sql_str(task_key)
            query += " ORDER BY updated_at DESC"
            cur.execute(query)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return _resp(200, {'submissions': [dict(r) for r in rows]})

    if method == 'POST':
        task_key = (body.get('task_key') or '').strip()
        task_title = (body.get('task_title') or '').strip()
        content = body.get('content') or {}
        status = body.get('status') or 'in_progress'

        if not task_key or not task_title:
            cur.close()
            conn.close()
            return _resp(400, {'error': 'task_key и task_title обязательны'})
        if status not in ('in_progress', 'submitted', 'reviewed'):
            status = 'in_progress'

        content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")

        cur.execute(
            """
            INSERT INTO submissions (user_id, task_key, task_title, content, status)
            VALUES (%s, %s, %s, %s::jsonb, %s)
            ON CONFLICT (user_id, task_key)
            DO UPDATE SET content = EXCLUDED.content, task_title = EXCLUDED.task_title,
                          status = EXCLUDED.status, updated_at = now()
            RETURNING *
            """ % (uid, _sql_str(task_key), _sql_str(task_title), _sql_str(content_json), _sql_str(status))
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return _resp(200, {'submission': dict(row)})

    if method == 'PUT':
        submission_id = params.get('id')
        if not submission_id:
            cur.close()
            conn.close()
            return _resp(400, {'error': 'id обязателен'})

        cur.execute("SELECT * FROM submissions WHERE id = %s" % int(submission_id))
        existing = cur.fetchone()
        if not existing:
            cur.close()
            conn.close()
            return _resp(404, {'error': 'Работа не найдена'})

        if role == 'teacher':
            grade = body.get('grade')
            comment = body.get('teacher_comment')
            new_status = body.get('status') or 'reviewed'
            cur.execute(
                """
                UPDATE submissions
                SET grade = %s, teacher_comment = %s, status = %s, updated_at = now()
                WHERE id = %s
                RETURNING *
                """ % (
                    'NULL' if grade is None else int(grade),
                    'NULL' if comment is None else _sql_str(comment),
                    _sql_str(new_status),
                    int(submission_id),
                )
            )
        else:
            if existing['user_id'] != uid:
                cur.close()
                conn.close()
                return _resp(403, {'error': 'Нет доступа к этой работе'})
            content = body.get('content')
            new_status = body.get('status') or existing['status']
            if content is not None:
                content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")
                cur.execute(
                    """
                    UPDATE submissions
                    SET content = %s::jsonb, status = %s, updated_at = now()
                    WHERE id = %s
                    RETURNING *
                    """ % (_sql_str(content_json), _sql_str(new_status), int(submission_id))
                )
            else:
                cur.execute(
                    "UPDATE submissions SET status = %s, updated_at = now() WHERE id = %s RETURNING *"
                    % (_sql_str(new_status), int(submission_id))
                )

        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return _resp(200, {'submission': dict(row)})

    cur.close()
    conn.close()
    return _resp(405, {'error': 'Метод не поддерживается'})


def _sql_str(value: str) -> str:
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"


def _resp(status: int, data: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }
