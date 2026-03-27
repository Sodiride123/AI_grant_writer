#!/bin/bash
# Script 1: Clone repo and install dependencies (run once to prepare the image)
set -e

git clone https://github.com/Sodiride123/AI_grant_writer.git /workspace/AI_grant_writer 2>/dev/null || echo "App already exists at /workspace/AI_grant_writer"
pip install flask flask-cors gunicorn python-docx pypdf2 fpdf2 pdfplumber anthropic 2>/dev/null
mkdir -p /workspace/AI_grant_writer/uploads /workspace/AI_grant_writer/jobs

# Install supervisor config from repo
cp /workspace/AI_grant_writer/_superninja_startup.conf /etc/supervisor/conf.d/_superninja_startup.conf
supervisorctl reread && supervisorctl update
echo "Setup complete. Run start.sh to launch the app."
