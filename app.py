import os
import json
import uuid
import time
import threading
from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from db import init_db, save_application, get_applications_list, get_application, delete_application, migrate_existing_jobs
from utils.document_parser import parse_document
from utils.ai_engine import (
    analyze_rfp_requirements,
    research_funding_agency,
    generate_project_narrative,
    generate_goals_objectives,
    generate_methodology,
    generate_evaluation_plan,
    generate_budget_justification,
    generate_organizational_capacity,
    generate_compliance_checklist,
    generate_executive_summary
)

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = os.urandom(24)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt', 'md'}

# File-based job store (shared across gunicorn workers)
JOBS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jobs')
os.makedirs(JOBS_DIR, exist_ok=True)

# Initialize database and migrate existing jobs
init_db()
migrate_existing_jobs(JOBS_DIR)

def _job_path(job_id):
    return os.path.join(JOBS_DIR, f"{job_id}.json")

def get_job(job_id):
    path = _job_path(job_id)
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def set_job(job_id, data):
    path = _job_path(job_id)
    with open(path, 'w') as f:
        json.dump(data, f)

def update_job(job_id, **kwargs):
    job = get_job(job_id)
    if job:
        job.update(kwargs)
        set_job(job_id, job)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_grant_application(job_id, file_path, org_details):
    """Background processing of grant application."""
    try:
        # Step 1: Parse document
        update_job(job_id, status='processing', step='Parsing RFP document...', progress=5)
        doc_result = parse_document(file_path)
        
        if not doc_result['success']:
            update_job(job_id, status='error', error=doc_result['error'])
            return
        
        rfp_text = doc_result['text']
        update_job(job_id, progress=10, step='Document parsed successfully. Analyzing requirements...')
        
        # Step 2: Analyze RFP requirements
        update_job(job_id, progress=15, step='Analyzing RFP requirements with AI...')
        rfp_analysis = analyze_rfp_requirements(rfp_text, org_details)
        update_job(job_id, progress=25, step='Requirements analyzed. Researching funding agency...')
        
        # Step 3: Research funding agency
        agency_name = rfp_analysis.get('funding_agency', 'Unknown Agency')
        program_name = rfp_analysis.get('program_name', 'Unknown Program')
        update_job(job_id, progress=30, step=f'Researching {agency_name} priorities and past awards...')
        agency_research = research_funding_agency(agency_name, program_name)
        update_job(job_id, progress=40, step='Agency research complete. Generating project narrative...')
        
        # Step 4: Generate project narrative
        update_job(job_id, progress=42, step='Crafting compelling project narrative...')
        project_narrative = generate_project_narrative(rfp_analysis, agency_research, org_details)
        update_job(job_id, progress=52, step='Project narrative complete. Writing goals & objectives...')
        
        # Step 5: Generate goals and objectives
        update_job(job_id, progress=54, step='Developing SMART goals and objectives...')
        goals_objectives = generate_goals_objectives(rfp_analysis, org_details)
        update_job(job_id, progress=62, step='Goals complete. Designing methodology...')
        
        # Step 6: Generate methodology
        update_job(job_id, progress=64, step='Designing project methodology...')
        methodology = generate_methodology(rfp_analysis, org_details)
        update_job(job_id, progress=72, step='Methodology complete. Creating evaluation plan...')
        
        # Step 7: Generate evaluation plan
        update_job(job_id, progress=74, step='Developing evaluation framework...')
        evaluation_plan = generate_evaluation_plan(rfp_analysis, org_details)
        update_job(job_id, progress=81, step='Evaluation plan complete. Building budget justification...')
        
        # Step 8: Generate budget justification
        update_job(job_id, progress=83, step='Calculating and justifying budget...')
        budget_justification = generate_budget_justification(rfp_analysis, org_details)
        update_job(job_id, progress=89, step='Budget complete. Writing organizational capacity...')
        
        # Step 9: Generate organizational capacity
        update_job(job_id, progress=91, step='Documenting organizational capacity...')
        organizational_capacity = generate_organizational_capacity(rfp_analysis, org_details)
        update_job(job_id, progress=94, step='Running compliance check...')
        
        # Step 10: Generate compliance checklist
        generated_sections = {
            'project_narrative': bool(project_narrative),
            'goals_objectives': bool(goals_objectives),
            'methodology': bool(methodology),
            'evaluation_plan': bool(evaluation_plan),
            'budget_justification': bool(budget_justification),
            'organizational_capacity': bool(organizational_capacity)
        }
        compliance_checklist = generate_compliance_checklist(rfp_text, rfp_analysis, generated_sections)
        update_job(job_id, progress=97, step='Generating executive summary...')
        
        # Step 11: Generate executive summary
        all_sections = {
            'project_narrative': project_narrative,
            'goals_objectives': goals_objectives,
            'methodology': methodology
        }
        executive_summary = generate_executive_summary(rfp_analysis, all_sections, org_details)
        
        # Compile results
        results = {
            'rfp_analysis': rfp_analysis,
            'agency_research': agency_research,
            'executive_summary': executive_summary,
            'project_narrative': project_narrative,
            'goals_objectives': goals_objectives,
            'methodology': methodology,
            'evaluation_plan': evaluation_plan,
            'budget_justification': budget_justification,
            'organizational_capacity': organizational_capacity,
            'compliance_checklist': compliance_checklist,
            'doc_info': {
                'word_count': doc_result['word_count'],
                'char_count': doc_result['char_count']
            }
        }
        
        update_job(job_id,
                   status='complete',
                   progress=100,
                   step='Grant application generated successfully!',
                   results=results)

        # Save completed application to database
        try:
            completed_job = get_job(job_id)
            save_application(job_id, completed_job)
        except Exception as e:
            print(f"Warning: Failed to save to database: {e}")

        # Clean up uploaded file
        try:
            os.remove(file_path)
        except:
            pass
            
    except Exception as e:
        import traceback
        error_msg = f"Error generating grant application: {str(e)}"
        print(traceback.format_exc())
        update_job(job_id, status='error', error=error_msg)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and start processing."""
    try:
        if 'rfp_file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['rfp_file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.'}), 400
        
        # Get organization details
        org_details_str = request.form.get('org_details', '{}')
        try:
            org_details = json.loads(org_details_str)
        except:
            org_details = {}
        
        # Save file
        filename = secure_filename(file.filename)
        job_id = str(uuid.uuid4())
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_{filename}")
        file.save(file_path)
        
        # Initialize job
        set_job(job_id, {
            'status': 'queued',
            'progress': 0,
            'step': 'Initializing...',
            'created_at': time.time(),
            'filename': filename
        })
        
        # Start background processing
        thread = threading.Thread(
            target=process_grant_application,
            args=(job_id, file_path, org_details),
            daemon=True
        )
        thread.start()
        
        return jsonify({'job_id': job_id, 'message': 'Processing started'})
    
    except RequestEntityTooLarge:
        return jsonify({'error': 'File too large. Maximum size is 32MB.'}), 413
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    """Get job processing status."""
    job = get_job(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    response = {
        'status': job.get('status'),
        'progress': job.get('progress', 0),
        'step': job.get('step', ''),
        'filename': job.get('filename', '')
    }

    if job.get('status') == 'error':
        response['error'] = job.get('error', 'Unknown error')

    if job.get('status') == 'complete':
        response['results'] = job.get('results', {})

    return jsonify(response)


def _get_export_results(job_id):
    """Get results for export from job store or database."""
    job = get_job(job_id)
    if not job or job.get('status') != 'complete':
        db_app = get_application(job_id)
        if db_app:
            return db_app['results']
        return None
    return job.get('results', {})


def _build_sections(results):
    """Build ordered sections list from results."""
    rfp = results.get('rfp_analysis', {})
    return {
        'meta': {
            'program': rfp.get('program_name', 'N/A'),
            'agency': rfp.get('funding_agency', 'N/A'),
            'opp_number': rfp.get('funding_opportunity_number', 'N/A'),
            'amount': rfp.get('award_ceiling', 'N/A'),
            'deadline': rfp.get('application_deadline', 'N/A'),
        },
        'sections': [
            ('Executive Summary', results.get('executive_summary', 'N/A')),
            ('Section 1: Project Narrative', results.get('project_narrative', 'N/A')),
            ('Section 2: Goals and Objectives', results.get('goals_objectives', 'N/A')),
            ('Section 3: Project Methodology', results.get('methodology', 'N/A')),
            ('Section 4: Evaluation Plan', results.get('evaluation_plan', 'N/A')),
            ('Section 5: Budget Justification', results.get('budget_justification', 'N/A')),
            ('Section 6: Organizational Capacity', results.get('organizational_capacity', 'N/A')),
        ]
    }


@app.route('/api/export/<job_id>', methods=['GET'])
def export_grant(job_id):
    """Export the grant application as TXT or PDF."""
    results = _get_export_results(job_id)
    if not results:
        return jsonify({'error': 'Application not found'}), 404

    fmt = request.args.get('format', 'txt').lower()
    data = _build_sections(results)
    meta = data['meta']
    program_name = meta['program'].replace(' ', '_')[:30] or 'Grant_Application'

    if fmt == 'pdf':
        return _export_pdf(job_id, data, program_name)
    return _export_txt(job_id, data, program_name)


def _export_txt(job_id, data, program_name):
    meta = data['meta']
    sep = '=' * 80
    lines = [f"\n{sep}", "GRANT APPLICATION - GENERATED BY GRANTWRITER PRO", sep, ""]
    lines.append(f"Program: {meta['program']}")
    lines.append(f"Agency: {meta['agency']}")
    lines.append(f"Opportunity Number: {meta['opp_number']}")
    lines.append(f"Award Amount: {meta['amount']}")
    lines.append(f"Deadline: {meta['deadline']}")

    for title, content in data['sections']:
        lines.extend(["", sep, title.upper(), sep, content])

    lines.extend(["", sep, "END OF GRANT APPLICATION", "Generated by GrantWriter Pro", sep])

    export_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_export.txt")
    with open(export_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return send_file(export_path, as_attachment=True,
                     download_name=f"Grant_Application_{program_name}.txt",
                     mimetype='text/plain')


def _export_pdf(job_id, data, program_name):
    from fpdf import FPDF
    import re

    meta = data['meta']
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Sanitize all meta text
    meta = {k: _sanitize_text(v) for k, v in meta.items()}

    # Title page
    pdf.set_font('Helvetica', 'B', 22)
    pdf.ln(30)
    pdf.cell(0, 12, 'Grant Application', new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.set_font('Helvetica', '', 14)
    pdf.ln(5)
    pdf.cell(0, 8, meta['program'], new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.ln(3)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(0, 7, meta['agency'], new_x='LMARGIN', new_y='NEXT', align='C')

    pdf.ln(15)
    pdf.set_font('Helvetica', '', 10)
    info_lines = [
        f"Opportunity Number: {meta['opp_number']}",
        f"Award Amount: {meta['amount']}",
        f"Deadline: {meta['deadline']}",
    ]
    for line in info_lines:
        pdf.cell(0, 6, line, new_x='LMARGIN', new_y='NEXT', align='C')

    pdf.ln(20)
    pdf.set_draw_color(79, 70, 229)
    pdf.set_line_width(0.5)
    pdf.line(30, pdf.get_y(), 180, pdf.get_y())
    pdf.ln(5)
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 6, 'Generated by GrantWriter Pro', new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.set_text_color(0, 0, 0)

    # Content sections
    for title, content in data['sections']:
        pdf.add_page()
        # Section header
        pdf.set_font('Helvetica', 'B', 16)
        pdf.set_text_color(79, 70, 229)
        pdf.cell(0, 10, title, new_x='LMARGIN', new_y='NEXT')
        pdf.set_draw_color(79, 70, 229)
        pdf.set_line_width(0.4)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(6)
        pdf.set_text_color(0, 0, 0)

        # Parse markdown-like content
        _pdf_write_content(pdf, content or 'N/A')

    export_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_export.pdf")
    pdf.output(export_path)

    return send_file(export_path, as_attachment=True,
                     download_name=f"Grant_Application_{program_name}.pdf",
                     mimetype='application/pdf')


def _sanitize_text(text):
    """Replace Unicode chars that Helvetica can't render."""
    replacements = {
        '\u2014': '--', '\u2013': '-', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2022': '*', '\u2026': '...',
        '\u2010': '-', '\u2011': '-', '\u2012': '-', '\u00a0': ' ',
        '\u200b': '', '\u200e': '', '\u200f': '', '\ufeff': '',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Remove any remaining non-latin1 characters
    return text.encode('latin-1', errors='replace').decode('latin-1')


def _pdf_write_content(pdf, text):
    """Write markdown-like text to PDF with basic formatting."""
    import re
    text = _sanitize_text(text)
    lines = text.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped:
            pdf.ln(3)
            continue

        # Headings
        if stripped.startswith('### '):
            pdf.set_font('Helvetica', 'B', 11)
            pdf.multi_cell(0, 6, stripped[4:])
            pdf.ln(2)
            pdf.set_font('Helvetica', '', 10)
        elif stripped.startswith('## '):
            pdf.set_font('Helvetica', 'B', 13)
            pdf.multi_cell(0, 7, stripped[3:])
            pdf.ln(2)
            pdf.set_font('Helvetica', '', 10)
        elif stripped.startswith('# '):
            pdf.set_font('Helvetica', 'B', 14)
            pdf.multi_cell(0, 8, stripped[2:])
            pdf.ln(2)
            pdf.set_font('Helvetica', '', 10)
        elif stripped.startswith('- ') or stripped.startswith('* '):
            pdf.set_font('Helvetica', '', 10)
            pdf.cell(8)
            clean = re.sub(r'\*\*(.+?)\*\*', r'\1', stripped[2:])
            pdf.multi_cell(0, 5.5, f"-  {clean}")
            pdf.ln(1)
        else:
            pdf.set_font('Helvetica', '', 10)
            clean = re.sub(r'\*\*(.+?)\*\*', r'\1', stripped)
            pdf.multi_cell(0, 5.5, clean)
            pdf.ln(1)


@app.route('/api/history', methods=['GET'])
def list_history():
    """List all saved grant applications."""
    applications = get_applications_list()
    return jsonify({'applications': applications})


@app.route('/api/history/<app_id>', methods=['GET'])
def view_history(app_id):
    """View a saved grant application with full results."""
    data = get_application(app_id)
    if not data:
        return jsonify({'error': 'Application not found'}), 404
    return jsonify({
        'status': 'complete',
        'results': data['results'],
        'program_name': data['program_name'],
        'funding_agency': data['funding_agency'],
        'created_at': data['created_at']
    })


@app.route('/api/history/<app_id>', methods=['DELETE'])
def remove_history(app_id):
    """Delete a saved grant application."""
    if delete_application(app_id):
        return jsonify({'message': 'Application deleted'})
    return jsonify({'error': 'Application not found'}), 404


if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(host='0.0.0.0', port=7860, debug=False)