#!/bin/bash
# Quick launcher for Alpha Launch monitoring
# Checks if server is running before starting monitoring

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🚀 Alpha Launch Monitoring Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if server is reachable
echo "Checking server at ${BASE_URL}..."
if curl -s -f -o /dev/null -m 5 "${BASE_URL}/api/health" 2>/dev/null; then
    echo "✅ Server is running and healthy"
    echo ""
    echo "Starting monitoring..."
    echo "Press Ctrl+C to stop and see summary"
    echo ""
    sleep 2
    exec ./scripts/monitor-alpha-launch.sh
else
    echo "❌ Server is not reachable at ${BASE_URL}"
    echo ""
    echo "Please start the server first:"
    echo ""
    echo "  Development:"
    echo "    npm run dev"
    echo ""
    echo "  Production:"
    echo "    npm run build"
    echo "    npm start"
    echo ""
    echo "Then run this script again or run the monitor directly:"
    echo "  ./scripts/monitor-alpha-launch.sh"
    echo ""
    exit 1
fi
