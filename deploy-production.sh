#!/bin/bash
set -e

# Production Deployment Script
# Simple test deployment (no SSL, access via IP)
#
# Usage: ./deploy-production.sh
#
# Prerequisites:
# - Docker and Docker Compose installed on host
# - Run this script from the project root directory
# - ANTHROPIC_API_KEY must be added to .env.production before app will work

echo "================================================"
echo "  Production Deployment - Simple Test"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production not found!${NC}"
    echo "Please ensure .env.production exists in the project root."
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if grep -q 'ANTHROPIC_API_KEY=""' .env.production; then
    echo -e "${YELLOW}⚠️  WARNING: ANTHROPIC_API_KEY is not set in .env.production${NC}"
    echo ""
    echo "The application will start but AI features (plan generation) will NOT work."
    echo ""
    echo "To add your API key:"
    echo "  1. Get your key from: https://console.anthropic.com/settings/keys"
    echo "  2. Edit .env.production and add: ANTHROPIC_API_KEY=\"sk-ant-...\""
    echo "  3. Restart: docker compose -f docker-compose.prod.yml restart app"
    echo ""
    read -p "Continue deployment without API key? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Add your ANTHROPIC_API_KEY first."
        exit 1
    fi
fi

# Stop any existing containers
echo -e "${GREEN}[1/5] Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build the application
echo -e "${GREEN}[2/5] Building application...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Start the database
echo -e "${GREEN}[3/5] Starting PostgreSQL database...${NC}"
docker compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo -e "${GREEN}[4/5] Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Start the application
echo -e "${GREEN}[5/5] Starting application...${NC}"
docker compose -f docker-compose.prod.yml up -d app

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "================================================"
echo "  Application Access"
echo "================================================"
echo ""
echo "  URL: http://31.97.91.250:3000"
echo "  Health: http://31.97.91.250:3000/api/health"
echo ""
echo "================================================"
echo "  Useful Commands"
echo "================================================"
echo ""
echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f app"
echo "  Stop app:      docker compose -f docker-compose.prod.yml down"
echo "  Restart app:   docker compose -f docker-compose.prod.yml restart app"
echo "  Check status:  docker compose -f docker-compose.prod.yml ps"
echo ""

# Check if app is running
echo "Checking application status..."
sleep 5
if docker compose -f docker-compose.prod.yml ps | grep -q "app.*Up"; then
    echo -e "${GREEN}✅ Application is running!${NC}"

    # Try to access health endpoint
    echo ""
    echo "Testing health endpoint..."
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        curl -s http://localhost:3000/api/health | jq '.' || cat
    else
        echo -e "${YELLOW}⚠️  Health check failed. Application may still be starting...${NC}"
        echo "Check logs with: docker compose -f docker-compose.prod.yml logs app"
    fi
else
    echo -e "${RED}❌ Application failed to start!${NC}"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs app"
    exit 1
fi

echo ""
if grep -q 'ANTHROPIC_API_KEY=""' .env.production; then
    echo -e "${YELLOW}⚠️  REMINDER: Add ANTHROPIC_API_KEY to .env.production for AI features!${NC}"
fi
