#!/bin/bash
# Script 2: Start the app (run by agent or user after image is ready)

# Ensure supervisor config is loaded
cp /workspace/_superninja_startup.conf /etc/supervisor/conf.d/_superninja_startup.conf 2>/dev/null
supervisorctl reread 2>/dev/null; supervisorctl update 2>/dev/null

# Clear port and start clean
supervisorctl stop 7860_python3.11 2>/dev/null; fuser -k 7860/tcp 2>/dev/null; sleep 2
supervisorctl start 7860_python3.11; sleep 3
supervisorctl status 7860_python3.11

echo ""
echo "App is running on port 7860."
echo ""
echo "Manage with supervisorctl:"
echo "  supervisorctl status 7860_python3.11    # check status"
echo "  supervisorctl restart 7860_python3.11   # restart after code changes"
echo "  supervisorctl stop 7860_python3.11      # stop"
echo "  supervisorctl start 7860_python3.11     # start"
