#!/bin/bash
# Production Start Script
# Starts the Talkvex application on port 3000

cd /paperclip/instances/default/workspaces/3378dda8-a284-4ee0-875a-04aab725b747

echo "=== Starting Talkvex Application ==="
echo "Time: $(date)"
echo ""

# Kill existing process
if [ -f /tmp/nextjs-app.pid ]; then
    OLD_PID=$(cat /tmp/nextjs-app.pid)
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Stopping existing process (PID: $OLD_PID)..."
        kill -9 "$OLD_PID" 2>/dev/null
        sleep 2
    fi
fi

# Force kill anything on port 3000
fuser -k 3000/tcp 2>/dev/null && echo "Killed process on port 3000"
sleep 2

# Start the application
echo "Starting application..."
PORT=3000 \
HOSTNAME=0.0.0.0 \
DATABASE_URL="postgresql://postgres:postgres@localhost:54329/metas_db?schema=public" \
NEXTAUTH_URL="http://31.97.91.250:3000" \
NEXTAUTH_SECRET="6Uc8sKNv7fC9GGohX03qmE7N2xFYyPlu2E5dvpZkakc=" \
ANTHROPIC_API_KEY="" \
NODE_ENV=production \
node .next/standalone/server.js > /tmp/nextjs-production.log 2>&1 &

APP_PID=$!
echo "$APP_PID" > /tmp/nextjs-app.pid

echo "✓ Started with PID: $APP_PID"
sleep 5

# Test the application
echo ""
echo "=== Health Check ==="
if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✓ Application is healthy"
    curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health
else
    echo "⚠ Health check failed - check logs"
fi

echo ""
echo "=== Application Info ==="
echo "  URL: http://31.97.91.250:3000"
echo "  Health: http://31.97.91.250:3000/api/health"
echo "  PID: $APP_PID"
echo "  Logs: /tmp/nextjs-production.log"
echo ""
echo "To view logs: tail -f /tmp/nextjs-production.log"
echo "To stop: kill $(cat /tmp/nextjs-app.pid)"
echo ""
echo "⚠ REMEMBER: Add ANTHROPIC_API_KEY to this script for AI features!"
