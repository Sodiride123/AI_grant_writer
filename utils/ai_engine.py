import os
import json
import re
from anthropic import Anthropic


def _load_settings():
    """Load AI gateway settings from settings JSON (primary: /dev/shm, fallback: ~/.claude)."""
    for path in ["/dev/shm/claude_settings.json", "/root/.claude/settings.json"]:
        try:
            with open(path) as f:
                env = json.load(f).get("env", {})
                if env.get("ANTHROPIC_AUTH_TOKEN"):
                    return env
        except (FileNotFoundError, json.JSONDecodeError):
            continue
    return {}


_settings = _load_settings()
MODEL = _settings.get("ANTHROPIC_MODEL", os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"))

client = Anthropic(
    auth_token=_settings.get("ANTHROPIC_AUTH_TOKEN", os.environ.get("ANTHROPIC_AUTH_TOKEN")),
    base_url=_settings.get("ANTHROPIC_BASE_URL", os.environ.get("ANTHROPIC_BASE_URL")),
)

def analyze_rfp_requirements(rfp_text, org_details):
    """Analyze RFP document and extract structured requirements."""
    
    # Truncate RFP text if too long
    max_chars = 80000
    if len(rfp_text) > max_chars:
        rfp_text = rfp_text[:max_chars] + "\n\n[Document truncated for analysis...]"
    
    prompt = f"""You are an expert grant writer and consultant with 20+ years of experience analyzing federal, state, and foundation grant opportunities.

Analyze this RFP/NOFO document and extract structured information.

RFP/NOFO DOCUMENT:
{rfp_text}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Extract and return a JSON object with the following structure:
{{
  "funding_agency": "Name of the funding agency",
  "program_name": "Name of the grant program",
  "cfda_number": "CFDA/ALN number if present",
  "funding_opportunity_number": "FON if present",
  "total_available_funding": "Total funding available",
  "award_ceiling": "Maximum award amount",
  "award_floor": "Minimum award amount",
  "number_of_awards": "Expected number of awards",
  "project_period": "Length of project period",
  "application_deadline": "Application deadline",
  "eligibility_requirements": ["list", "of", "eligibility", "requirements"],
  "program_priorities": ["list", "of", "key", "program", "priorities"],
  "required_sections": ["list", "of", "required", "application", "sections"],
  "page_limits": {{"section_name": "page limit"}},
  "evaluation_criteria": [{{"criterion": "name", "weight": "percentage or points", "description": "brief description"}}],
  "key_requirements": ["list", "of", "critical", "requirements"],
  "prohibited_activities": ["list", "of", "prohibited", "activities"],
  "matching_requirements": "any cost share or match requirements",
  "reporting_requirements": ["list", "of", "reporting", "requirements"],
  "focus_areas": ["main", "focus", "areas", "or", "topics"],
  "target_population": "target population or beneficiaries",
  "geographic_focus": "geographic requirements or preferences",
  "submission_instructions": "how to submit",
  "contact_information": "program officer contact info",
  "agency_priorities_summary": "2-3 sentence summary of what the agency is looking for"
}}

Return ONLY the JSON object, no other text."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = message.content[0].text.strip()
    
    # Clean JSON
    if response_text.startswith("```"):
        response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
        response_text = re.sub(r'\n?```$', '', response_text)
    
    try:
        return json.loads(response_text)
    except:
        return {"raw_analysis": response_text, "error": "Could not parse structured response"}


def research_funding_agency(agency_name, program_name):
    """Research funding agency priorities and past awards."""
    
    prompt = f"""You are an expert grant researcher. Provide detailed intelligence about this funding agency and program based on your training data.

FUNDING AGENCY: {agency_name}
PROGRAM: {program_name}

Provide a comprehensive research report as JSON:
{{
  "agency_overview": "2-3 paragraph overview of the agency's mission and priorities",
  "agency_history": "Brief history and context",
  "current_strategic_priorities": ["list", "of", "current", "priorities"],
  "funding_philosophy": "How the agency evaluates and selects grantees",
  "typical_award_profile": "Description of typically funded projects",
  "past_award_examples": [
    {{"project": "project title/description", "amount": "award amount", "key_features": "what made it fundable"}}
  ],
  "reviewer_preferences": ["what", "reviewers", "look", "for"],
  "common_weaknesses": ["common", "application", "weaknesses", "to", "avoid"],
  "success_factors": ["key", "factors", "that", "lead", "to", "funding"],
  "political_context": "Current political/policy context relevant to this program",
  "equity_focus": "Agency's approach to equity and inclusion",
  "innovation_preference": "How the agency views innovation vs. proven approaches",
  "partnership_value": "How the agency views partnerships and collaborations",
  "evidence_requirements": "Types of evidence and data the agency values",
  "writing_tips": ["specific", "writing", "tips", "for", "this", "agency"],
  "red_flags": ["things", "that", "could", "disqualify", "or", "weaken", "application"]
}}

Return ONLY the JSON object."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=6000,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
        response_text = re.sub(r'\n?```$', '', response_text)

    try:
        return json.loads(response_text)
    except:
        return {"raw_research": response_text}


def generate_project_narrative(rfp_analysis, agency_research, org_details):
    """Generate a compelling project narrative."""
    
    prompt = f"""You are an expert grant writer who has secured over $50 million in grants. Write a compelling, professional project narrative for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

AGENCY RESEARCH:
{json.dumps(agency_research, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Write a comprehensive Project Narrative that includes:
1. **Executive Summary** - Compelling opening that hooks the reviewer (2-3 paragraphs)
2. **Statement of Need** - Data-driven need statement with statistics and evidence (3-4 paragraphs)
3. **Project Description** - Detailed description of what you will do (4-5 paragraphs)
4. **Innovation & Significance** - What makes this approach unique and important (2-3 paragraphs)
5. **Target Population & Geographic Area** - Who and where (2 paragraphs)
6. **Partnerships & Collaboration** - Key partners and their roles (2 paragraphs)
7. **Sustainability Plan** - How the project will continue after funding ends (2 paragraphs)

Guidelines:
- Use active voice and compelling language
- Include specific data points and statistics where relevant
- Directly address the agency's stated priorities
- Connect organizational strengths to project needs
- Be specific with numbers, timelines, and outcomes
- Avoid jargon; write clearly and persuasively
- Total length: 1500-2000 words

Write the full narrative now:"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_goals_objectives(rfp_analysis, org_details):
    """Generate SMART goals and objectives."""
    
    prompt = f"""You are an expert grant writer. Create a comprehensive Goals and Objectives section for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Create a Goals and Objectives section with:
1. **Overall Project Goal** - One overarching goal statement
2. **3-4 Specific Objectives** - Each following SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
   - For each objective include:
     * Clear objective statement
     * Measurable targets/metrics
     * Timeline
     * Key activities to achieve it
     * Expected outputs
3. **Logic Model Summary** - Brief description of inputs → activities → outputs → outcomes → impact
4. **Performance Indicators** - 8-10 key performance indicators (KPIs) with baseline and target values
5. **Short-term Outcomes** (6-12 months)
6. **Long-term Outcomes** (1-3 years)
7. **Impact Statement** - Ultimate change you seek to create

Make all objectives directly responsive to the RFP requirements and the organization's capacity.
Write this as flowing professional prose with clear structure.
Length: 800-1000 words"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_methodology(rfp_analysis, org_details):
    """Generate detailed project methodology."""
    
    prompt = f"""You are an expert grant writer and program designer. Create a detailed Methodology section for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Write a comprehensive Methodology section covering:
1. **Project Design & Approach** - Overall theoretical/conceptual framework (2-3 paragraphs)
2. **Evidence Base** - Research and evidence supporting your approach (2 paragraphs)
3. **Implementation Plan** - Phase-by-phase breakdown:
   - Phase 1: Planning & Preparation (with specific activities and timeline)
   - Phase 2: Implementation (with specific activities and timeline)
   - Phase 3: Assessment & Refinement (with specific activities and timeline)
4. **Project Timeline** - Detailed month-by-month or quarter-by-quarter timeline as a narrative description
5. **Key Personnel & Roles** - Staff roles and responsibilities
6. **Community Engagement Strategy** - How you will engage target population
7. **Data Collection & Management** - How you will track progress
8. **Risk Management** - Potential challenges and mitigation strategies
9. **Quality Assurance** - How you will ensure program quality
10. **Dissemination Plan** - How you will share learnings

Be specific about activities, timelines, responsible parties, and methods.
Reference evidence-based practices where appropriate.
Length: 1200-1500 words"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=3500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_evaluation_plan(rfp_analysis, org_details):
    """Generate comprehensive evaluation plan."""
    
    prompt = f"""You are an expert grant writer and program evaluator. Create a rigorous Evaluation Plan for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Write a comprehensive Evaluation Plan covering:
1. **Evaluation Overview** - Purpose and approach to evaluation (2 paragraphs)
2. **Evaluation Questions** - 4-5 primary evaluation questions
3. **Evaluation Design** - Type of evaluation (process, outcome, impact) and design rationale
4. **Data Collection Methods** - Specific methods for each objective:
   - Quantitative measures (surveys, administrative data, etc.)
   - Qualitative measures (interviews, focus groups, observations)
   - Data sources and instruments
5. **Data Analysis Plan** - How data will be analyzed
6. **Evaluator Qualifications** - Who will conduct the evaluation (internal/external)
7. **Evaluation Timeline** - When data will be collected and reports produced
8. **Performance Measurement Framework** - Table/description of:
   - Output indicators
   - Short-term outcome indicators
   - Long-term outcome indicators
   - Data source for each
   - Collection frequency
   - Baseline and target values
9. **Reporting Plan** - What reports will be produced and when
10. **Use of Evaluation Findings** - How findings will inform program improvements
11. **Continuous Quality Improvement** - CQI process

Make the evaluation plan rigorous, practical, and directly tied to project objectives.
Length: 900-1100 words"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_budget_justification(rfp_analysis, org_details):
    """Generate detailed budget and justification."""
    
    award_ceiling = rfp_analysis.get('award_ceiling', 'up to $500,000')
    project_period = rfp_analysis.get('project_period', '12 months')
    
    prompt = f"""You are an expert grant budget specialist. Create a detailed Budget Narrative/Justification for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Award Ceiling: {award_ceiling}
Project Period: {project_period}

Create a comprehensive Budget Justification covering all standard budget categories. For each line item provide:
- Item description
- Calculation method (e.g., FTE %, hourly rate × hours, etc.)
- Justification for why it's necessary
- Total amount

Budget sections to include:

**A. PERSONNEL**
- Project Director/Manager (position description, FTE, salary, fringe)
- Program Coordinator (position description, FTE, salary, fringe)
- Other key staff
- Fringe benefits calculation

**B. FRINGE BENEFITS**
- Rate and calculation

**C. TRAVEL**
- Local travel (mileage, purpose)
- Conference travel (if applicable)

**D. EQUIPMENT**
- Any equipment over $5,000

**E. SUPPLIES**
- Office supplies
- Program materials
- Technology/software

**F. CONTRACTUAL/CONSULTANTS**
- Evaluation consultant
- Specialized contractors
- Partner sub-awards

**G. OTHER DIRECT COSTS**
- Participant costs (if applicable)
- Training costs
- Communications
- Indirect costs

**H. INDIRECT COSTS**
- Rate and calculation

**BUDGET SUMMARY TABLE** - Create a text-based summary showing costs by category and year.

**COST REASONABLENESS STATEMENT** - Brief statement on how costs are reasonable and necessary.

Make all costs realistic, well-justified, and appropriate for the program scope.
Reference federal cost principles (2 CFR 200) where appropriate.
Length: 1000-1200 words"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=3500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_organizational_capacity(rfp_analysis, org_details):
    """Generate organizational capacity section."""
    
    prompt = f"""You are an expert grant writer. Create a compelling Organizational Capacity section demonstrating the applicant's ability to successfully implement this project.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

ORGANIZATION DETAILS:
{json.dumps(org_details, indent=2)}

Write a comprehensive Organizational Capacity section covering:
1. **Organizational Overview** - Mission, history, size, and scope (2-3 paragraphs)
2. **Track Record & Experience** - Relevant past projects and accomplishments (3 paragraphs)
3. **Financial Management Capacity** - Financial systems, audits, fiscal management (2 paragraphs)
4. **Staff Qualifications** - Key personnel qualifications and expertise (2-3 paragraphs)
5. **Infrastructure & Resources** - Facilities, technology, systems in place (1-2 paragraphs)
6. **Community Relationships** - Existing relationships with target population (2 paragraphs)
7. **Partnership Network** - Key partners and established relationships (2 paragraphs)
8. **Cultural Competence** - Approach to serving diverse populations (1-2 paragraphs)
9. **Grant Management Experience** - Experience managing federal/state grants (2 paragraphs)
10. **Quality & Compliance Systems** - How you ensure compliance and quality (1-2 paragraphs)

Emphasize the organization's unique strengths and why it is best positioned to implement this project.
Connect organizational capabilities directly to project requirements.
Length: 900-1100 words"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2800,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text


def generate_compliance_checklist(rfp_text, rfp_analysis, generated_sections):
    """Generate a comprehensive compliance checklist."""
    
    prompt = f"""You are an expert grant compliance specialist. Create a comprehensive compliance checklist for this grant application.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

GENERATED APPLICATION SECTIONS:
- Project Narrative: {"✓ Generated" if generated_sections.get("project_narrative") else "✗ Missing"}
- Goals & Objectives: {"✓ Generated" if generated_sections.get("goals_objectives") else "✗ Missing"}
- Methodology: {"✓ Generated" if generated_sections.get("methodology") else "✗ Missing"}
- Evaluation Plan: {"✓ Generated" if generated_sections.get("evaluation_plan") else "✗ Missing"}
- Budget Justification: {"✓ Generated" if generated_sections.get("budget_justification") else "✗ Missing"}
- Organizational Capacity: {"✓ Generated" if generated_sections.get("organizational_capacity") else "✗ Missing"}

Create a detailed compliance checklist as JSON with the following structure:
{{
  "overall_compliance_score": "percentage (0-100)",
  "critical_items": [
    {{
      "category": "category name",
      "item": "compliance item description",
      "status": "complete|incomplete|review_needed",
      "notes": "specific notes or recommendations",
      "rfp_reference": "section/page reference if available"
    }}
  ],
  "administrative_requirements": [
    {{
      "item": "requirement",
      "status": "complete|incomplete|review_needed",
      "notes": "notes"
    }}
  ],
  "programmatic_requirements": [
    {{
      "item": "requirement",
      "status": "complete|incomplete|review_needed",
      "notes": "notes"
    }}
  ],
  "budget_requirements": [
    {{
      "item": "requirement",
      "status": "complete|incomplete|review_needed",
      "notes": "notes"
    }}
  ],
  "narrative_requirements": [
    {{
      "item": "requirement",
      "status": "complete|incomplete|review_needed",
      "notes": "notes"
    }}
  ],
  "submission_requirements": [
    {{
      "item": "requirement",
      "status": "complete|incomplete|review_needed",
      "notes": "notes"
    }}
  ],
  "pre_submission_actions": [
    "action item 1",
    "action item 2"
  ],
  "reviewer_score_prediction": {{
    "estimated_score": "score range",
    "strengths": ["strength 1", "strength 2"],
    "areas_for_improvement": ["area 1", "area 2"],
    "competitive_assessment": "brief assessment"
  }}
}}

Include 5-8 items per category. Keep notes brief (one sentence max). Mark items as complete based on what was generated.
Return ONLY the JSON object."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=10000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
        response_text = re.sub(r'\n?```$', '', response_text)
    
    try:
        return json.loads(response_text)
    except:
        return {"raw_checklist": response_text, "error": "Could not parse checklist"}


def generate_executive_summary(rfp_analysis, all_sections, org_details):
    """Generate a brief executive summary of the application."""
    
    prompt = f"""Create a concise executive summary (300-400 words) of this grant application.

RFP: {rfp_analysis.get('program_name', 'Grant Program')} 
Agency: {rfp_analysis.get('funding_agency', 'Funding Agency')}
Organization: {org_details.get('org_name', 'Applicant Organization')}
Requested Amount: {rfp_analysis.get('award_ceiling', 'Amount TBD')}
Project Period: {rfp_analysis.get('project_period', 'Period TBD')}
Focus Areas: {', '.join(rfp_analysis.get('focus_areas', [])[:3])}
Target Population: {rfp_analysis.get('target_population', 'Community members')}

Write a professional executive summary that:
1. Opens with a compelling hook
2. States the problem/need
3. Describes the proposed solution
4. Highlights key outcomes expected
5. Emphasizes organizational qualifications
6. Closes with a call to fund

Write in first person plural (we/our) from the organization's perspective."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text