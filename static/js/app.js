// ===== GRANTWRITER PRO — MAIN APP =====

let currentJobId = null;
let pollInterval = null;
let currentResults = null;

// ── SVG icon snippets used in dynamic JS rendering ──
const SVG = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M8 10h.01M8 14h.01M16 10h.01M16 14h.01"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  hash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  clipboardList: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initDropzone();
  initFormSections();
  initTabs();
  initScrollAnimations();
});

// ===== DROPZONE =====
function initDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('rfp-file');
  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(e => {
    dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(e => {
    dropzone.addEventListener(e, ev => {
      if (e === 'drop') ev.preventDefault();
      dropzone.classList.remove('drag-over');
    });
  });
  dropzone.addEventListener('drop', ev => {
    const files = ev.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  });
  fileInput.addEventListener('change', ev => {
    if (ev.target.files.length > 0) handleFileSelect(ev.target.files[0]);
  });
}

function handleFileSelect(file) {
  const allowed = ['pdf', 'docx', 'doc', 'txt', 'md'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowed.includes(ext)) {
    showToast('Invalid file type. Please upload PDF, DOCX, DOC, or TXT.', 'error');
    return;
  }
  if (file.size > 32 * 1024 * 1024) {
    showToast('File too large. Maximum size is 32 MB.', 'error');
    return;
  }
  const fileInput = document.getElementById('rfp-file');
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  showFileSelected(file);
  showToast(`"${file.name}" selected successfully.`, 'success');
}

function showFileSelected(file) {
  const container = document.getElementById('file-selected');
  const ext = file.name.split('.').pop().toLowerCase();
  const sizeStr = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(1)} KB`
    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  container.innerHTML = `
    <div class="file-selected fade-in-up">
      <div class="file-icon">${SVG.fileText}</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${sizeStr} &middot; ${ext.toUpperCase()} document</div>
      </div>
      <button class="file-remove" onclick="removeFile()" title="Remove file" aria-label="Remove file">
        ${SVG.x}
      </button>
    </div>`;
  container.style.display = 'block';
}

function removeFile() {
  document.getElementById('rfp-file').value = '';
  const container = document.getElementById('file-selected');
  container.innerHTML = '';
  container.style.display = 'none';
  showToast('File removed.', 'warning');
}

// ===== FORM SECTIONS =====
function initFormSections() {
  document.querySelectorAll('.form-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const chevron = header.querySelector('.form-section-chevron');
      const isOpen = body.classList.contains('open');
      body.classList.toggle('open', !isOpen);
      if (chevron) chevron.classList.toggle('open', !isOpen);
    });
  });
  // Open first section
  const firstBody = document.querySelector('.form-section-body');
  const firstChevron = document.querySelector('.form-section-chevron');
  if (firstBody) firstBody.classList.add('open');
  if (firstChevron) firstChevron.classList.add('open');
}

// ===== TABS =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  const content = document.getElementById(`tab-${tabId}`);
  if (btn) btn.classList.add('active');
  if (content) {
    content.classList.add('active');
    content.classList.add('fade-in-up');
    setTimeout(() => content.classList.remove('fade-in-up'), 500);
  }
}

// ===== FORM SUBMISSION =====
async function submitForm() {
  const fileInput = document.getElementById('rfp-file');
  if (!fileInput.files || fileInput.files.length === 0) {
    showToast('Please upload an RFP/NOFO document first.', 'error');
    document.getElementById('dropzone').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const orgName = document.getElementById('org-name').value.trim();
  if (!orgName) {
    showToast('Please enter your organization name.', 'error');
    document.getElementById('org-name').focus();
    return;
  }

  const orgDetails = collectOrgDetails();
  const formData = new FormData();
  formData.append('rfp_file', fileInput.files[0]);
  formData.append('org_details', JSON.stringify(orgDetails));

  setGenerateBtn(true);
  showSection('progress');

  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Upload failed');
    currentJobId = data.job_id;
    startPolling(currentJobId);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    setGenerateBtn(false);
    showSection('form');
  }
}

function collectOrgDetails() {
  return {
    org_name:          document.getElementById('org-name').value,
    org_type:          document.getElementById('org-type').value,
    org_mission:       document.getElementById('org-mission').value,
    org_location:      document.getElementById('org-location').value,
    years_operating:   document.getElementById('years-operating').value,
    annual_budget:     document.getElementById('annual-budget').value,
    staff_count:       document.getElementById('staff-count').value,
    target_population: document.getElementById('target-population').value,
    key_programs:      document.getElementById('key-programs').value,
    past_grants:       document.getElementById('past-grants').value,
    key_partners:      document.getElementById('key-partners').value,
    unique_strengths:  document.getElementById('unique-strengths').value,
    indirect_rate:     document.getElementById('indirect-rate').value,
    project_title:     document.getElementById('project-title').value,
    requested_amount:  document.getElementById('requested-amount').value,
  };
}

// ===== SAMPLE OUTPUT =====
async function runDemo() {
  setGenerateBtn(true, true);
  showToast('Loading sample grant application...', 'info');

  try {
    const res = await fetch('/static/sample_output.json');
    if (!res.ok) throw new Error('Failed to load sample output');
    const results = await res.json();
    currentResults = results;
    currentJobId = 'sample';
    renderResults(results);
    showSection('results');
    setGenerateBtn(false);
    showToast('Sample HHS Community Health grant application loaded.', 'success');
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    setGenerateBtn(false);
    showSection('form');
  }
}

// ===== POLLING =====
const PROGRESS_STEPS = [
  { threshold:  5, label: 'Parsing RFP document' },
  { threshold: 15, label: 'Analyzing requirements' },
  { threshold: 30, label: 'Researching funding agency' },
  { threshold: 42, label: 'Writing project narrative' },
  { threshold: 54, label: 'Developing goals & objectives' },
  { threshold: 64, label: 'Designing methodology' },
  { threshold: 74, label: 'Creating evaluation plan' },
  { threshold: 83, label: 'Building budget justification' },
  { threshold: 91, label: 'Writing organizational capacity' },
  { threshold: 94, label: 'Running compliance check' },
  { threshold: 97, label: 'Generating executive summary' },
  { threshold: 100, label: 'Finalizing application' },
];

function startPolling(jobId) {
  updateProgressUI(0, 'Initializing...');
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/status/${jobId}`);
      const data = await res.json();
      if (data.error && !data.status) {
        clearInterval(pollInterval);
        showToast(`Error: ${data.error}`, 'error');
        setGenerateBtn(false);
        showSection('form');
        return;
      }
      updateProgressUI(data.progress || 0, data.step || '');
      if (data.status === 'error') {
        clearInterval(pollInterval);
        showToast(`Generation failed: ${data.error}`, 'error');
        setGenerateBtn(false);
        showSection('form');
      }
      if (data.status === 'complete') {
        clearInterval(pollInterval);
        currentResults = data.results;
        setTimeout(() => {
          renderResults(data.results);
          showSection('results');
          setGenerateBtn(false);
          showToast('Grant application generated successfully.', 'success');
          document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        }, 800);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 1500);
}

function updateProgressUI(progress, stepText) {
  const fill = document.getElementById('progress-ring-fill');
  if (fill) {
    const offset = 326 - (progress / 100) * 326;
    fill.style.strokeDashoffset = offset;
  }
  const pct = document.getElementById('progress-percent');
  if (pct) pct.textContent = `${Math.round(progress)}%`;
  const stepEl = document.getElementById('progress-step');
  if (stepEl && stepText) stepEl.textContent = stepText;

  PROGRESS_STEPS.forEach((step, i) => {
    const item = document.getElementById(`step-item-${i}`);
    if (!item) return;
    const iconEl = item.querySelector('.step-icon');
    const prevThreshold = PROGRESS_STEPS[i - 1]?.threshold || 0;

    if (progress >= step.threshold) {
      item.className = 'progress-step-item done';
      if (iconEl) iconEl.innerHTML = SVG.check;
    } else if (progress >= prevThreshold && progress < step.threshold) {
      item.className = 'progress-step-item active';
    } else {
      item.className = 'progress-step-item';
    }
  });
}

// ===== RENDER RESULTS =====
function renderResults(results) {
  const rfp      = results.rfp_analysis      || {};
  const agency   = results.agency_research   || {};
  const checklist= results.compliance_checklist || {};

  // Header metadata
  document.getElementById('result-program-name').textContent = rfp.program_name        || '—';
  document.getElementById('result-agency').textContent       = rfp.funding_agency      || 'Funding Agency';
  document.getElementById('result-deadline').textContent     = rfp.application_deadline|| 'See RFP';
  document.getElementById('result-amount').textContent       = rfp.award_ceiling       || 'See RFP';
  document.getElementById('result-period').textContent       = rfp.project_period      || 'See RFP';
  document.getElementById('result-fon').textContent          = rfp.funding_opportunity_number || rfp.cfda_number || '—';

  const score = checklist.overall_compliance_score || '85%';
  document.getElementById('compliance-score-val').textContent = score;

  renderRfpAnalysis(rfp);
  renderAgencyResearch(agency);
  renderTextSection('narrative-content',   results.project_narrative);
  renderTextSection('goals-content',       results.goals_objectives);
  renderTextSection('methodology-content', results.methodology);
  renderTextSection('evaluation-content',  results.evaluation_plan);
  renderTextSection('budget-content',      results.budget_justification);
  renderTextSection('capacity-content',    results.organizational_capacity);

  const execEl = document.getElementById('executive-summary-text');
  if (execEl) execEl.textContent = results.executive_summary || '';

  renderComplianceChecklist(checklist);
}

// ── RFP ANALYSIS ──
function renderRfpAnalysis(rfp) {
  const container = document.getElementById('rfp-analysis-content');
  if (!container) return;

  const cards = [
    { icon: SVG.building, color: '#e0e7ff', title: 'Funding Agency',    value: rfp.funding_agency        || '—' },
    { icon: SVG.clipboardList, color: '#eef2ff', title: 'Program Name', value: rfp.program_name          || '—' },
    { icon: SVG.dollar,   color: '#d1fae5', title: 'Award Ceiling',     value: rfp.award_ceiling         || '—' },
    { icon: SVG.calendar, color: '#fef3c7', title: 'Deadline',          value: rfp.application_deadline  || '—' },
    { icon: SVG.clock,    color: '#fee2e2', title: 'Project Period',     value: rfp.project_period        || '—' },
    { icon: SVG.users,    color: '#fce7f3', title: 'Target Population', value: rfp.target_population     || '—' },
  ];

  const priorities  = rfp.program_priorities       || [];
  const eligibility = rfp.eligibility_requirements || [];
  const focusAreas  = rfp.focus_areas              || [];
  const evalCriteria= rfp.evaluation_criteria      || [];

  let html = `<div class="analysis-grid">
    ${cards.map(c => `
      <div class="analysis-card">
        <div class="analysis-card-header">
          <div class="analysis-card-icon" style="background:${c.color};color:var(--gray-600)">${c.icon}</div>
          <div class="analysis-card-title">${c.title}</div>
        </div>
        <div class="analysis-card-value">${c.value}</div>
      </div>`).join('')}
  </div>`;

  if (priorities.length) {
    html += `<div style="margin-bottom:1.75rem;">
      <div style="font-size:.82rem;font-weight:700;color:var(--gray-700);margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem;">
        ${SVG.target} Program Priorities
      </div>
      <div class="tag-list">${priorities.map(p => `<span class="tag tag-purple">${p}</span>`).join('')}</div>
    </div>`;
  }

  if (eligibility.length) {
    html += `<div style="margin-bottom:1.75rem;">
      <div style="font-size:.82rem;font-weight:700;color:var(--gray-700);margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem;">
        ${SVG.checkCircle} Eligibility Requirements
      </div>
      <div class="tag-list">${eligibility.map(e => `<span class="tag tag-green">${e}</span>`).join('')}</div>
    </div>`;
  }

  if (focusAreas.length) {
    html += `<div style="margin-bottom:1.75rem;">
      <div style="font-size:.82rem;font-weight:700;color:var(--gray-700);margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem;">
        ${SVG.search} Focus Areas
      </div>
      <div class="tag-list">${focusAreas.map(f => `<span class="tag tag-blue">${f}</span>`).join('')}</div>
    </div>`;
  }

  if (evalCriteria.length) {
    html += `<div style="margin-bottom:1.75rem;">
      <div style="font-size:.82rem;font-weight:700;color:var(--gray-700);margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem;">
        ${SVG.trendingUp} Evaluation Criteria
      </div>
      <table class="eval-table">
        <thead><tr><th>Criterion</th><th>Weight</th><th>Description</th></tr></thead>
        <tbody>
          ${evalCriteria.map(c => {
            const w = parseInt(c.weight) || 20;
            return `<tr>
              <td><strong>${c.criterion || '—'}</strong></td>
              <td>
                <span style="font-weight:700;color:var(--primary)">${c.weight || '—'}</span>
                <div class="weight-bar"><div class="weight-fill" style="width:${Math.min(w,100)}%"></div></div>
              </td>
              <td>${c.description || '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  if (rfp.agency_priorities_summary) {
    html += `<div class="executive-summary-box">
      <div class="exec-summary-label">Agency Priorities Summary</div>
      <div class="exec-summary-text">${rfp.agency_priorities_summary}</div>
    </div>`;
  }

  container.innerHTML = html;
}

// ── AGENCY RESEARCH ──
function renderAgencyResearch(agency) {
  const container = document.getElementById('agency-research-content');
  if (!container || !agency) return;

  const priorities   = agency.current_strategic_priorities || [];
  const success      = agency.success_factors              || [];
  const tips         = agency.writing_tips                 || [];
  const redFlags     = agency.red_flags                    || [];
  const weaknesses   = agency.common_weaknesses            || [];
  const reviewerPrefs= agency.reviewer_preferences         || [];
  const pastAwards   = agency.past_award_examples          || [];

  const makeList = (items) => items.length
    ? `<ul class="research-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`
    : `<p style="color:var(--gray-400);font-size:.85rem;">No data available.</p>`;

  let html = `<div class="research-grid">
    <div class="research-card" style="grid-column:1/-1">
      <div class="research-card-title">${SVG.building} Agency Overview</div>
      <div class="research-card-body">${agency.agency_overview || '—'}</div>
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.target} Strategic Priorities</div>
      ${makeList(priorities)}
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.checkCircle} Success Factors</div>
      ${makeList(success)}
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.edit} Writing Tips</div>
      ${makeList(tips)}
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.alertTriangle} Red Flags to Avoid</div>
      ${makeList(redFlags)}
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.search} What Reviewers Look For</div>
      ${makeList(reviewerPrefs)}
    </div>
    <div class="research-card">
      <div class="research-card-title">${SVG.info} Common Weaknesses</div>
      ${makeList(weaknesses)}
    </div>
  </div>`;

  if (agency.funding_philosophy) {
    html += `<div class="executive-summary-box" style="margin-top:2rem;">
      <div class="exec-summary-label">Funding Philosophy</div>
      <div class="exec-summary-text">${agency.funding_philosophy}</div>
    </div>`;
  }

  if (pastAwards.length) {
    html += `<div style="margin-top:2rem;">
      <div style="font-size:.85rem;font-weight:700;color:var(--gray-800);margin-bottom:1rem;display:flex;align-items:center;gap:.45rem;">
        ${SVG.award} Past Award Examples
      </div>
      <div style="display:flex;flex-direction:column;gap:.85rem;">
        ${pastAwards.map(a => `
          <div class="analysis-card">
            <div style="font-weight:600;color:var(--gray-800);font-size:.88rem;margin-bottom:.35rem;">${a.project || ''}</div>
            ${a.amount ? `<div style="color:var(--accent);font-weight:700;font-size:.82rem;margin-bottom:.25rem;">Award: ${a.amount}</div>` : ''}
            ${a.key_features ? `<div style="color:var(--gray-500);font-size:.8rem;">${a.key_features}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

// ── TEXT SECTION (markdown-like) ──
function renderTextSection(containerId, text) {
  const container = document.getElementById(containerId);
  if (!container || !text) return;

  const html = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  container.innerHTML = `<div class="content-body"><p>${html}</p></div>`;
}

// ── COMPLIANCE CHECKLIST ──
function renderComplianceChecklist(checklist) {
  const container = document.getElementById('compliance-content');
  if (!container) return;

  const score    = checklist.overall_compliance_score || '85%';
  const scoreNum = parseInt(score);
  const scoreClass = scoreNum >= 80 ? 'score-high' : scoreNum >= 60 ? 'score-medium' : 'score-low';

  const statusConfig = {
    complete:       { svg: `<div style="color:var(--accent)">${SVG.checkCircle}</div>`,      cls: 'status-complete',   label: 'Complete' },
    incomplete:     { svg: `<div style="color:var(--warning)">${SVG.alertTriangle}</div>`,   cls: 'status-incomplete', label: 'Action Required' },
    review_needed:  { svg: `<div style="color:var(--primary)">${SVG.search}</div>`,          cls: 'status-review',     label: 'Review Needed' },
  };

  const categories = [
    { key: 'critical_items',             label: 'Critical Requirements',       icon: SVG.shield },
    { key: 'administrative_requirements',label: 'Administrative Requirements', icon: SVG.clipboardList },
    { key: 'programmatic_requirements',  label: 'Programmatic Requirements',   icon: SVG.target },
    { key: 'narrative_requirements',     label: 'Narrative Requirements',      icon: SVG.edit },
    { key: 'budget_requirements',        label: 'Budget Requirements',         icon: SVG.dollar },
    { key: 'submission_requirements',    label: 'Submission Requirements',     icon: SVG.zap },
  ];

  let html = `
    <div class="compliance-header">
      <div class="compliance-score">
        <div class="score-circle ${scoreClass}">
          <span>${score}</span>
          <span class="score-label">Score</span>
        </div>
        <div class="score-info">
          <h3>Compliance Score: ${score}</h3>
          <p>
            ${scoreNum >= 80
              ? `${SVG.checkCircle} Strong application — ready for final review`
              : scoreNum >= 60
                ? `${SVG.alertTriangle} Good progress — address flagged items`
                : `${SVG.x} Needs work — review all flagged items`}
          </p>
        </div>
      </div>
    </div>`;

  categories.forEach(cat => {
    const items = checklist[cat.key] || [];
    if (!items.length) return;
    const done = items.filter(i => i.status === 'complete').length;

    html += `
      <div class="checklist-section">
        <div class="checklist-section-title">
          ${cat.icon} ${cat.label}
          <span style="margin-left:auto;font-size:.75rem;color:var(--gray-400);font-weight:600;">${done}/${items.length} complete</span>
        </div>
        ${items.map(item => {
          const sc = statusConfig[item.status] || statusConfig.review_needed;
          return `
            <div class="checklist-item ${sc.cls}">
              <div class="checklist-status-icon">${sc.svg}</div>
              <div class="checklist-item-content">
                <div class="checklist-item-text">${item.item || item.criterion || ''}</div>
                ${item.notes ? `<div class="checklist-item-notes">${item.notes}</div>` : ''}
              </div>
              ${item.rfp_reference ? `<span class="checklist-ref">${item.rfp_reference}</span>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  });

  // Pre-submission actions
  const actions = checklist.pre_submission_actions || [];
  if (actions.length) {
    html += `
      <div class="checklist-section">
        <div class="checklist-section-title">${SVG.clipboardList} Pre-Submission Action Items</div>
        ${actions.map(a => `
          <div class="checklist-item status-review">
            <div class="checklist-status-icon">${SVG.info}</div>
            <div class="checklist-item-content">
              <div class="checklist-item-text">${a}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  // Reviewer prediction
  const pred = checklist.reviewer_score_prediction || {};
  if (pred.estimated_score || (pred.strengths || []).length) {
    html += `
      <div class="prediction-card">
        <div class="prediction-title">
          ${SVG.star}
          Reviewer Score Prediction
          ${pred.estimated_score ? `<span class="tag tag-purple" style="margin-left:auto;">${pred.estimated_score}</span>` : ''}
        </div>
        <div class="prediction-grid">
          <div class="prediction-col">
            <h4>Application Strengths</h4>
            <ul class="prediction-list">
              ${(pred.strengths || []).map(s => `<li>${SVG.check} <span>${s}</span></li>`).join('')}
            </ul>
          </div>
          <div class="prediction-col">
            <h4>Areas for Improvement</h4>
            <ul class="prediction-list">
              ${(pred.areas_for_improvement || []).map(a => `<li>${SVG.arrowRight} <span>${a}</span></li>`).join('')}
            </ul>
          </div>
        </div>
        ${pred.competitive_assessment ? `
          <div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid #e0e7ff;">
            <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-500);font-weight:700;margin-bottom:.45rem;">Competitive Assessment</div>
            <div style="font-size:.88rem;color:var(--gray-700);">${pred.competitive_assessment}</div>
          </div>` : ''}
      </div>`;
  }

  container.innerHTML = html;
}

// ===== SECTION VISIBILITY =====
function showSection(section) {
  document.getElementById('form-wrapper').style.display     = section === 'form'     ? 'block' : 'none';
  document.getElementById('progress-section').style.display  = section === 'progress' ? 'block' : 'none';
  document.getElementById('results-section').style.display   = section === 'results'  ? 'block' : 'none';
  document.getElementById('history-section').style.display   = section === 'history'  ? 'block' : 'none';
}

// ===== HISTORY =====
async function showHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    renderHistory(data.applications || []);
    showSection('history');
    document.getElementById('app-section').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast(`Error loading history: ${err.message}`, 'error');
  }
}

function renderHistory(applications) {
  const container = document.getElementById('history-list');
  if (!applications.length) {
    container.innerHTML = `
      <div class="history-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gray-300)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>No applications yet.</p>
        <p style="font-size:.85rem;color:var(--gray-400)">Generate your first grant application to see it here.</p>
      </div>`;
    return;
  }

  container.innerHTML = applications.map(app => {
    const date = new Date(app.created_at * 1000);
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="history-card">
        <div class="history-card-body">
          <div class="history-card-title">${app.program_name || 'Untitled Application'}</div>
          <div class="history-card-meta">
            <span>${SVG.building} ${app.funding_agency || 'Unknown Agency'}</span>
            ${app.award_ceiling ? `<span>${SVG.dollar} ${app.award_ceiling}</span>` : ''}
            ${app.compliance_score ? `<span>${SVG.shield} Score: ${app.compliance_score}</span>` : ''}
          </div>
          <div class="history-card-date">${dateStr} at ${timeStr}</div>
        </div>
        <div class="history-card-actions">
          <button class="btn btn-primary btn-sm" onclick="viewApplication('${app.id}')">View</button>
          <button class="btn btn-outline btn-sm" onclick="exportApplication('${app.id}', 'pdf')">PDF</button>
          <button class="btn btn-outline btn-sm" onclick="exportApplication('${app.id}', 'txt')">TXT</button>
          <button class="btn btn-outline btn-sm history-delete-btn" onclick="deleteApplication('${app.id}')" title="Delete">
            ${SVG.x}
          </button>
        </div>
      </div>`;
  }).join('');
}

async function viewApplication(appId) {
  showToast('Loading application...', 'info');
  try {
    const res = await fetch(`/api/history/${appId}`);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Failed to load');
    currentJobId = appId;
    currentResults = data.results;
    renderResults(data.results);
    showSection('results');
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function deleteApplication(appId) {
  if (!confirm('Delete this application? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/history/${appId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    showToast('Application deleted.', 'success');
    showHistory();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ===== UTILITIES =====
function setGenerateBtn(loading) {
  const btn     = document.getElementById('generate-btn');
  const demoBtn = document.getElementById('demo-btn');
  if (btn) {
    btn.disabled = loading;
    if (loading) {
      btn.innerHTML = `
        <span class="spin">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.67"/></svg>
        </span>
        Generating
        <span class="loading-dots"><span></span><span></span><span></span></span>`;
    } else {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Generate Grant Application`;
    }
  }
  if (demoBtn) demoBtn.disabled = loading;
}

function copyToClipboard(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText || el.textContent).then(() => {
    showToast('Copied to clipboard.', 'success');
  }).catch(() => {
    showToast('Could not copy text.', 'error');
  });
}

function exportApplication(jobId, format = 'pdf') {
  const id = jobId || currentJobId;
  if (!id || id === 'sample') {
    showToast('Export is not available for the sample output.', 'warning');
    return;
  }
  window.open(`/api/export/${id}?format=${format}`, '_blank');
  showToast(`Downloading ${format.toUpperCase()}...`, 'success');
}

function startOver() {
  if (pollInterval) clearInterval(pollInterval);
  currentJobId = null;
  currentResults = null;
  showSection('form');
  setGenerateBtn(false);
  const el = document.getElementById('app-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToApp() {
  showSection('form');
  setGenerateBtn(false);
  const el = document.getElementById('app-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── TOAST ──
const TOAST_ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <span>${message}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ── SCROLL ANIMATIONS ──
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feature-card').forEach(el => observer.observe(el));
}