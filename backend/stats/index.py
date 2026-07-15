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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
    'Access-Control-Max-Age': '86400',
}

COURSE_TASK_KEYS = [
    'task-1-idea-triz', 'task-2-baccm', 'task-3-stakeholders', 'task-4-smart',
    'task-5-persona', 'task-6-gantt', 'task-7-risks', 'task-8-raci',
    'task-9-kanban', 'task-10-kpi', 'task-11-tcoroi', 'task-12-csi',
]

PROGRESS_BY_STATUS = {
    'in_progress': 40,
    'submitted': 75,
    'needs_revision': 55,
    'reviewed': 100,
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
    """Публичная статистика платформы и личный прогресс/рейтинг недели для авторизованного студента"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'GET':
        return _resp(405, {'error': 'Метод не поддерживается'})

    secret = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
    auth = get_user(event, secret)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'student'")
    students_count = cur.fetchone()['c']

    cur.execute(
        """
        SELECT
            (SELECT COUNT(*) FROM submissions WHERE status = 'reviewed') +
            (SELECT COUNT(*) FROM design_documents WHERE status = 'accepted') AS c
        """
    )
    completed_projects = cur.fetchone()['c']

    cur.execute(
        """
        SELECT u.id AS user_id, u.name, u.full_name, u.group_name,
               COUNT(s.id) AS completed_count,
               AVG(EXTRACT(EPOCH FROM (s.updated_at - s.created_at))) AS avg_seconds
        FROM users u
        JOIN submissions s ON s.user_id = u.id
            AND s.status = 'reviewed'
            AND s.updated_at >= now() - interval '7 days'
        WHERE u.role = 'student'
        GROUP BY u.id, u.name, u.full_name, u.group_name
        ORDER BY completed_count DESC, avg_seconds ASC
        """
    )
    weekly_rows = cur.fetchall()

    weekly_leaderboard = [
        {
            'user_id': r['user_id'],
            'name': r['name'],
            'full_name': r['full_name'],
            'group_name': r['group_name'],
            'completed_count': r['completed_count'],
            'avg_hours': round(float(r['avg_seconds']) / 3600, 1) if r['avg_seconds'] is not None else None,
        }
        for r in weekly_rows[:5]
    ]

    cur.execute(
        """
        SELECT u.id AS user_id, u.name, u.full_name, u.group_name,
               COUNT(s.id) FILTER (WHERE s.status = 'reviewed') AS completed_count
        FROM users u
        LEFT JOIN submissions s ON s.user_id = u.id
        WHERE u.role = 'student' AND u.full_name IS NOT NULL AND u.group_name IS NOT NULL
        GROUP BY u.id, u.name, u.full_name, u.group_name
        ORDER BY completed_count DESC, u.name ASC
        """
    )
    public_rows = cur.fetchall()

    def level_for(completed: int) -> dict:
        total = len(COURSE_TASK_KEYS)
        if completed >= total:
            return {'label': 'Стратег', 'icon': 'BrainCircuit', 'color': 'from-violet-500 to-purple-600'}
        if completed >= 10:
            return {'label': 'Эксперт', 'icon': 'Crown', 'color': 'from-emerald-500 to-teal-600'}
        if completed >= 6:
            return {'label': 'Профи', 'icon': 'Trophy', 'color': 'from-amber-500 to-yellow-600'}
        if completed >= 3:
            return {'label': 'Спринтер', 'icon': 'Target', 'color': 'from-cyan-500 to-blue-600'}
        if completed >= 1:
            return {'label': 'Первый старт', 'icon': 'Rocket', 'color': 'from-fuchsia-500 to-pink-600'}
        return {'label': 'Новичок', 'icon': 'Sparkles', 'color': 'from-slate-500 to-slate-600'}

    public_leaderboard = [
        {
            'user_id': r['user_id'],
            'name': r['name'],
            'full_name': r['full_name'],
            'group_name': r['group_name'],
            'completed_count': r['completed_count'],
            'level': level_for(r['completed_count']),
        }
        for r in public_rows
    ]

    students_progress = None
    if auth and auth.get('role') == 'teacher':
        cur.execute("SELECT id, name, full_name, group_name FROM users WHERE role = 'student' ORDER BY name")
        student_rows = cur.fetchall()

        cur.execute("SELECT user_id, task_key, status FROM submissions")
        all_submissions = cur.fetchall()
        by_user: dict = {}
        for r in all_submissions:
            by_user.setdefault(r['user_id'], {})[r['task_key']] = r['status']

        students_progress = []
        for s in student_rows:
            subs = by_user.get(s['id'], {})
            total_completed = 0
            total_started = 0
            for task_key in COURSE_TASK_KEYS:
                status = subs.get(task_key)
                if status:
                    total_started += 1
                    if status == 'reviewed':
                        total_completed += 1
            students_progress.append({
                'user_id': s['id'],
                'name': s['name'],
                'full_name': s['full_name'],
                'group_name': s['group_name'],
                'total_completed_count': total_completed,
                'total_started_count': total_started,
            })

    me = None
    if auth and auth.get('role') == 'student':
        uid = int(auth['uid'])

        cur.execute("SELECT id, name, full_name, group_name FROM users WHERE id = %s" % uid)
        me_row = cur.fetchone()

        if me_row:
            cur.execute("SELECT task_key, status FROM submissions WHERE user_id = %s" % uid)
            my_submissions = {r['task_key']: r['status'] for r in cur.fetchall()}

            courses = []
            total_completed = 0
            total_started = 0
            total_submitted = 0
            for task_key in COURSE_TASK_KEYS:
                status = my_submissions.get(task_key)
                if status:
                    total_started += 1
                    if status == 'reviewed':
                        total_completed += 1
                    if status == 'submitted':
                        total_submitted += 1
                progress_percent = PROGRESS_BY_STATUS.get(status, 0)
                courses.append({
                    'task_key': task_key,
                    'status': status or 'not_started',
                    'progress_percent': progress_percent,
                })

            weekly_rank = None
            weekly_completed_count = 0
            for idx, r in enumerate(weekly_rows):
                if r['user_id'] == uid:
                    weekly_rank = idx + 1
                    weekly_completed_count = r['completed_count']
                    break

            cur.execute(
                "SELECT COUNT(*) AS c FROM submissions WHERE user_id = %s AND updated_at >= now() - interval '7 days'"
                % uid
            )
            active_this_week = cur.fetchone()['c'] > 0

            cur.execute("SELECT COUNT(*) AS c FROM design_documents WHERE user_id = %s AND status = 'accepted'" % uid)
            design_doc_accepted = cur.fetchone()['c'] > 0

            cur.execute(
                "SELECT task_title FROM submissions WHERE user_id = %s AND status = 'reviewed' ORDER BY updated_at DESC LIMIT 1"
                % uid
            )
            last_row = cur.fetchone()
            last_completed_task_title = last_row['task_title'] if last_row else None

            me = {
                'user_id': uid,
                'name': me_row['name'],
                'full_name': me_row['full_name'],
                'group_name': me_row['group_name'],
                'weekly_rank': weekly_rank,
                'weekly_completed_count': weekly_completed_count,
                'total_completed_count': total_completed,
                'total_started_count': total_started,
                'total_submitted_count': total_submitted,
                'design_doc_accepted': design_doc_accepted,
                'last_completed_task_title': last_completed_task_title,
                'courses': courses,
                'badges': {
                    'first_start': total_started >= 1,
                    'on_streak': active_this_week,
                    'sprinter': total_completed >= 10,
                    'champion': weekly_rank is not None and weekly_rank <= 3,
                    'strategist': total_completed >= len(COURSE_TASK_KEYS),
                },
            }

    cur.close()
    conn.close()

    return _resp(200, {
        'overview': {
            'students_count': students_count,
            'courses_count': len(COURSE_TASK_KEYS),
            'completed_projects': completed_projects,
        },
        'weekly_leaderboard': weekly_leaderboard,
        'public_leaderboard': public_leaderboard,
        'me': me,
        'students_progress': students_progress,
    })


def _resp(status: int, data: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }