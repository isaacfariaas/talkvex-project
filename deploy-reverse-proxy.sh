#!/bin/bash
# Deployment script for nginx reverse proxy
# Run this on the host VPS with Docker installed

set -e

echo "🚀 Deploying nginx reverse proxy for Paperclip external access"
echo "=================================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    exit 1
fi

# Show current configuration
echo ""
echo "📋 Configuration files:"
ls -lh nginx.conf docker-compose.reverse-proxy.yml

# Start the reverse proxy
echo ""
echo "🔧 Starting nginx reverse proxy..."
docker compose -f docker-compose.reverse-proxy.yml up -d

# Wait for nginx to start
sleep 3

# Check if container is running
echo ""
echo "📊 Container status:"
docker compose -f docker-compose.reverse-proxy.yml ps

# Test external connectivity
echo ""
echo "🧪 Testing external connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "http://paperclip-fulb.srv928136.hstgr.cloud" | grep -q "200"; then
    echo "✅ External URL is now accessible!"
else
    echo "⚠️  External URL test returned non-200 status"
    echo "   This may be normal if the Paperclip app needs initialization"
fi

# Show logs
echo ""
echo "📝 Recent nginx logs:"
docker compose -f docker-compose.reverse-proxy.yml logs --tail=20 nginx

echo ""
echo "=================================================="
echo "✅ Deployment complete!"
echo ""
echo "External URL: http://paperclip-fulb.srv928136.hstgr.cloud"
echo "Internal API: http://127.0.0.1:3100"
echo ""
echo "To view logs: docker compose -f docker-compose.reverse-proxy.yml logs -f nginx"
echo "To stop: docker compose -f docker-compose.reverse-proxy.yml down"
