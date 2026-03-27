#!/bin/bash
# Script 1: Clone repo and install dependencies (run once to prepare the image)
set -e

git clone https://github.com/Sodiride123/AI_grant_writer.git /workspace/AI_grant_writer 2>/dev/null || echo "App already exists at /workspace/AI_grant_writer"
pip install flask flask-cors gunicorn python-docx pypdf2 fpdf2 anthropic 2>/dev/null
mkdir -p /workspace/AI_grant_writer/uploads /workspace/AI_grant_writer/jobs

# Create supervisor startup config
cat > /workspace/_superninja_startup.conf << 'EOF'
[program:7860_python3.11]
command=/bin/bash -c "source ~/.bashrc 2>/dev/null; exec /usr/local/bin/python3.11 /usr/local/bin/gunicorn --bind 0.0.0.0:7860 --workers 2 --threads 4 --timeout 300 --keep-alive 5 --log-level info app:app"
directory=/workspace/AI_grant_writer
user=root
autostart=true
autorestart=true
startsecs=3
startretries=3
stderr_logfile=/var/log/supervisor/7860_python3.11.err.log
stdout_logfile=/var/log/supervisor/7860_python3.11.out.log
stdout_logfile_maxbytes=5MB
stdout_logfile_backups=2
stderr_logfile_maxbytes=5MB
stderr_logfile_backups=2
EOF

cp /workspace/_superninja_startup.conf /etc/supervisor/conf.d/_superninja_startup.conf
supervisorctl reread && supervisorctl update
echo "Setup complete. Run start.sh to launch the app."
