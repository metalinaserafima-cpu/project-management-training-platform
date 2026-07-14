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

VALID_STATUSES = ('in_progress', 'submitted', 'accepted', 'needs_revision')
VALID_PROJECT_TYPES = ('construction', 'marketing', 'event', 'production', 'social', 'other')


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
    """Создание, редактирование и проверка дизайн-документов зачётного задания (студент/преподаватель)"""
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
        doc_id = params.get('id')

        if doc_id:
            cur.execute(
                """
                SELECT d.*, u.name AS student_name, u.email AS student_email
                FROM design_documents d JOIN users u ON u.id = d.user_id
                WHERE d.id = %s
                """ % int(doc_id)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return _resp(404, {'error': 'Документ не найден'})
            if role != 'teacher' and row['user_id'] != uid:
                return _resp(403, {'error': 'Нет доступа к этому документу'})
            return _resp(200, {'document': dict(row)})

        if role == 'teacher':
            query = """
                SELECT d.*, u.name AS student_name, u.email AS student_email
                FROM design_documents d JOIN users u ON u.id = d.user_id
                WHERE d.status != 'in_progress'
                ORDER BY d.updated_at DESC
            """
            cur.execute(query)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return _resp(200, {'documents': [dict(r) for r in rows]})
        else:
            cur.execute("SELECT * FROM design_documents WHERE user_id = %s ORDER BY updated_at DESC" % uid)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return _resp(200, {'documents': [dict(r) for r in rows]})

    if method == 'POST':
        title = (body.get('title') or '').strip()
        project_type = body.get('project_type') or 'other'
        if project_type not in VALID_PROJECT_TYPES:
            project_type = 'other'

        if not title:
            cur.close()
            conn.close()
            return _resp(400, {'error': 'Название проекта обязательно'})

        cur.execute(
            """
            INSERT INTO design_documents (user_id, title, project_type, status, sections)
            VALUES (%s, %s, %s, 'in_progress', '{}'::jsonb)
            RETURNING *
            """ % (uid, _sql_str(title), _sql_str(project_type))
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return _resp(200, {'document': dict(row)})

    if method == 'PUT':
        doc_id = params.get('id')
        if not doc_id:
            cur.close()
            conn.close()
            return _resp(400, {'error': 'id обязателен'})

        cur.execute("SELECT * FROM design_documents WHERE id = %s" % int(doc_id))
        existing = cur.fetchone()
        if not existing:
            cur.close()
            conn.close()
            return _resp(404, {'error': 'Документ не найден'})

        if role == 'teacher':
            action = body.get('action')
            if action == 'accept':
                cur.execute(
                    "UPDATE design_documents SET status = 'accepted', teacher_comment = NULL, updated_at = now() WHERE id = %s RETURNING *"
                    % int(doc_id)
                )
            elif action == 'revise':
                comment = body.get('teacher_comment') or ''
                cur.execute(
                    "UPDATE design_documents SET status = 'needs_revision', teacher_comment = %s, updated_at = now() WHERE id = %s RETURNING *"
                    % (_sql_str(comment), int(doc_id))
                )
            else:
                cur.close()
                conn.close()
                return _resp(400, {'error': 'Неизвестное действие'})
        else:
            if existing['user_id'] != uid:
                cur.close()
                conn.close()
                return _resp(403, {'error': 'Нет доступа к этому документу'})
            if existing['status'] == 'submitted' or existing['status'] == 'accepted':
                cur.close()
                conn.close()
                return _resp(403, {'error': 'Документ на проверке или уже принят, редактирование недоступно'})

            title = body.get('title')
            project_type = body.get('project_type')
            sections = body.get('sections')
            new_status = body.get('status')

            updates = []
            if title is not None:
                updates.append("title = %s" % _sql_str(title.strip()))
            if project_type is not None and project_type in VALID_PROJECT_TYPES:
                updates.append("project_type = %s" % _sql_str(project_type))
            if sections is not None:
                sections_json = json.dumps(sections, ensure_ascii=False).replace("'", "''")
                updates.append("sections = %s::jsonb" % _sql_str(sections_json))
            if new_status is not None and new_status in VALID_STATUSES:
                updates.append("status = %s" % _sql_str(new_status))
                if new_status == 'submitted':
                    updates.append("submitted_at = now()")

            if not updates:
                cur.close()
                conn.close()
                return _resp(400, {'error': 'Нет данных для обновления'})

            updates.append("updated_at = now()")
            cur.execute(
                "UPDATE design_documents SET %s WHERE id = %s RETURNING *" % (', '.join(updates), int(doc_id))
            )

        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return _resp(200, {'document': dict(row)})

    if method == 'DELETE':
        doc_id = params.get('id')
        if not doc_id:
            cur.close()
            conn.close()
            return _resp(400, {'error': 'id обязателен'})

        cur.execute("SELECT * FROM design_documents WHERE id = %s" % int(doc_id))
        existing = cur.fetchone()
        if not existing:
            cur.close()
            conn.close()
            return _resp(404, {'error': 'Документ не найден'})
        if existing['user_id'] != uid:
            cur.close()
            conn.close()
            return _resp(403, {'error': 'Нет доступа к этому документу'})

        cur.execute("DELETE FROM design_documents WHERE id = %s" % int(doc_id))
        conn.commit()
        cur.close()
        conn.close()
        return _resp(200, {'success': True})

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
