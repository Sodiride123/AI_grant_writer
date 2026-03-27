# GrantWriter Pro

AI-powered grant application generator. Upload an RFP, enter your org details, and get a complete grant application in minutes.

## What It Does

- Analyzes RFP/NOFO documents and extracts requirements
- Researches the funding agency's priorities
- Generates all major sections: narrative, goals, methodology, evaluation, budget, org capacity
- Runs a compliance checklist with predicted reviewer score
- Exports as PDF or TXT
- Saves all applications to a history for later viewing/download

## Tech Stack

- **Backend:** Flask + Gunicorn (Python 3.11)
- **AI:** Anthropic Claude via LiteLLM gateway
- **Database:** SQLite (auto-created at `grantwriter.db`)
- **Frontend:** Vanilla HTML/CSS/JS (no framework)

## Deployment

```bash
# First time — clone and install
bash setup.sh

# Start the app (port 7860)
bash start.sh
```

## App Management

```bash
supervisorctl status 7860_python3.11     # check status
supervisorctl restart 7860_python3.11    # restart after code changes
supervisorctl stop 7860_python3.11       # stop
supervisorctl start 7860_python3.11      # start
```

## File Structure

```
app.py              # Flask routes and job processing
db.py               # SQLite persistence layer
utils/ai_engine.py  # AI generation (10 section generators)
utils/document_parser.py  # PDF/DOCX/TXT parsing
templates/index.html      # Single-page frontend
static/                   # CSS, JS, sample output
setup.sh            # Clone + install dependencies
start.sh            # Start/restart the app
```

## AI Credentials

Reads from `/dev/shm/claude_settings.json` (fallback: `/root/.claude/settings.json`). No env vars needed.
