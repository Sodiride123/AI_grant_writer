"""SQLite database for persisting completed grant applications."""
import os
import json
import sqlite3
import time

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'grantwriter.db')


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the applications table if it doesn't exist."""
    conn = _connect()
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                program_name TEXT,
                funding_agency TEXT,
                award_ceiling TEXT,
                application_deadline TEXT,
                org_name TEXT,
                filename TEXT,
                compliance_score TEXT,
                results_json TEXT NOT NULL,
                created_at REAL NOT NULL,
                saved_at REAL NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()


def save_application(job_id, job_data):
    """Save a completed application to the database."""
    results = job_data.get('results', {})
    rfp = results.get('rfp_analysis', {})
    checklist = results.get('compliance_checklist', {})

    conn = _connect()
    try:
        conn.execute("""
            INSERT OR REPLACE INTO applications
            (id, program_name, funding_agency, award_ceiling, application_deadline,
             org_name, filename, compliance_score, results_json, created_at, saved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job_id,
            rfp.get('program_name', ''),
            rfp.get('funding_agency', ''),
            rfp.get('award_ceiling', ''),
            rfp.get('application_deadline', ''),
            rfp.get('applicant_organization', ''),
            job_data.get('filename', ''),
            checklist.get('overall_compliance_score', ''),
            json.dumps(results),
            job_data.get('created_at', time.time()),
            time.time()
        ))
        conn.commit()
    finally:
        conn.close()


def get_applications_list():
    """Return all saved applications (metadata only, no results blob)."""
    conn = _connect()
    try:
        rows = conn.execute("""
            SELECT id, program_name, funding_agency, award_ceiling,
                   application_deadline, org_name, filename, compliance_score, created_at
            FROM applications
            ORDER BY created_at DESC
        """).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get_application(app_id):
    """Return a single application with full results."""
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM applications WHERE id = ?", (app_id,)
        ).fetchone()
        if not row:
            return None
        data = dict(row)
        data['results'] = json.loads(data.pop('results_json'))
        return data
    finally:
        conn.close()


def delete_application(app_id):
    """Delete a saved application."""
    conn = _connect()
    try:
        cursor = conn.execute("DELETE FROM applications WHERE id = ?", (app_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def migrate_existing_jobs(jobs_dir):
    """Migrate completed jobs from file-based store to database."""
    if not os.path.exists(jobs_dir):
        return

    conn = _connect()
    try:
        existing_ids = {row[0] for row in conn.execute("SELECT id FROM applications").fetchall()}
    finally:
        conn.close()

    migrated = 0
    for filename in os.listdir(jobs_dir):
        if not filename.endswith('.json'):
            continue
        job_id = filename[:-5]
        if job_id in existing_ids:
            continue
        try:
            with open(os.path.join(jobs_dir, filename)) as f:
                job_data = json.load(f)
            if job_data.get('status') == 'complete' and 'results' in job_data:
                save_application(job_id, job_data)
                migrated += 1
        except Exception as e:
            print(f"Skipping migration of {filename}: {e}")

    if migrated:
        print(f"Migrated {migrated} completed jobs to database.")
