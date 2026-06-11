#!/bin/bash
# Alpha Launch Monitoring Script for TalkVex
# Monitors system health, response times, and logs all metrics

set -euo pipefail

# Configuration
MONITOR_INTERVAL=${MONITOR_INTERVAL:-30}  # seconds between checks
LOG_DIR="./logs/monitoring"
LOG_FILE="${LOG_DIR}/alpha-launch-$(date +%Y%m%d).log"
METRICS_FILE="${LOG_DIR}/metrics-$(date +%Y%m%d).json"
BASE_URL="${BASE_URL:-http://localhost:3000}"
ALERT_THRESHOLD_MS=${ALERT_THRESHOLD_MS:-2000}  # Alert if response > 2s
ERROR_COUNT=0
MAX_ERRORS_BEFORE_ALERT=3

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p "$LOG_DIR"

# Initialize log file
echo "=== Alpha Launch Monitoring Started at $(date -Iseconds) ===" | tee -a "$LOG_FILE"
echo "Base URL: $BASE_URL" | tee -a "$LOG_FILE"
echo "Check interval: ${MONITOR_INTERVAL}s" | tee -a "$LOG_FILE"
echo "Alert threshold: ${ALERT_THRESHOLD_MS}ms" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to log with timestamp
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date -Iseconds)
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Function to check health endpoint
check_health() {
    local start_time=$(date +%s%3N)
    local response
    local http_code
    local response_time

    # Make the request and capture both response and HTTP code
    response=$(curl -s -w "\n%{http_code}" -m 10 "${BASE_URL}/api/health" 2>&1) || {
        log "ERROR" "Failed to connect to health endpoint"
        return 1
    }

    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))

    # Extract HTTP code from last line
    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | head -n-1)

    # Parse JSON response
    local status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    local db_status=$(echo "$response" | grep -o '"db":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

    # Log the check
    if [ "$http_code" = "200" ] && [ "$status" = "ok" ]; then
        if [ "$response_time" -gt "$ALERT_THRESHOLD_MS" ]; then
            echo -e "${YELLOW}⚠ SLOW${NC}  Health: ${status} | DB: ${db_status} | Response: ${response_time}ms | HTTP: ${http_code}" | tee -a "$LOG_FILE"
        else
            echo -e "${GREEN}✓ OK${NC}    Health: ${status} | DB: ${db_status} | Response: ${response_time}ms | HTTP: ${http_code}" | tee -a "$LOG_FILE"
        fi
        ERROR_COUNT=0
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}  Health: ${status} | DB: ${db_status} | Response: ${response_time}ms | HTTP: ${http_code}" | tee -a "$LOG_FILE"
        log "ERROR" "Response: ${response}"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        return 1
    fi

    # Append to metrics file (JSON Lines format)
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"endpoint\":\"health\",\"http_code\":${http_code},\"response_time_ms\":${response_time},\"status\":\"${status}\",\"db\":\"${db_status}\"}" >> "$METRICS_FILE"
}

# Function to check key API endpoints
check_endpoints() {
    local endpoints=(
        "/api/health"
        # Add more critical endpoints as needed
    )

    for endpoint in "${endpoints[@]}"; do
        local start_time=$(date +%s%3N)
        local http_code=$(curl -o /dev/null -s -w "%{http_code}" -m 10 "${BASE_URL}${endpoint}" || echo "000")
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))

        # Log endpoint check
        if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then  # 401 is expected for auth-required endpoints
            log "INFO" "Endpoint ${endpoint}: HTTP ${http_code}, ${response_time}ms"
        else
            log "WARN" "Endpoint ${endpoint}: HTTP ${http_code}, ${response_time}ms"
        fi

        # Append to metrics
        echo "{\"timestamp\":\"$(date -Iseconds)\",\"endpoint\":\"${endpoint}\",\"http_code\":${http_code},\"response_time_ms\":${response_time}}" >> "$METRICS_FILE"
    done
}

# Function to display monitoring summary
show_summary() {
    echo ""
    echo "=== Monitoring Summary ===" | tee -a "$LOG_FILE"

    # Count checks from log
    local total_checks=$(grep -c "\[INFO\]\|\[WARN\]\|\[ERROR\]" "$LOG_FILE" || echo 0)
    local errors=$(grep -c "\[ERROR\]" "$LOG_FILE" || echo 0)
    local warnings=$(grep -c "\[WARN\]" "$LOG_FILE" || echo 0)

    echo "Total checks: ${total_checks}" | tee -a "$LOG_FILE"
    echo "Errors: ${errors}" | tee -a "$LOG_FILE"
    echo "Warnings: ${warnings}" | tee -a "$LOG_FILE"

    # Calculate uptime percentage
    if [ "$total_checks" -gt 0 ]; then
        local success=$((total_checks - errors))
        local uptime=$((success * 100 / total_checks))
        echo "Uptime: ${uptime}%" | tee -a "$LOG_FILE"
    fi

    echo "" | tee -a "$LOG_FILE"
}

# Trap SIGINT and SIGTERM for graceful shutdown
trap 'log "INFO" "Monitoring stopped by user"; show_summary; exit 0' INT TERM

# Main monitoring loop
log "INFO" "Starting continuous monitoring..."
echo ""

check_count=0
while true; do
    check_count=$((check_count + 1))

    # Header every 20 checks
    if [ $((check_count % 20)) -eq 1 ]; then
        echo ""
        echo "Check #${check_count} - $(date +"%Y-%m-%d %H:%M:%S")"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Perform health check
    check_health

    # Alert if multiple consecutive errors
    if [ "$ERROR_COUNT" -ge "$MAX_ERRORS_BEFORE_ALERT" ]; then
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}🚨 ALERT: ${MAX_ERRORS_BEFORE_ALERT} consecutive errors detected!${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        log "ALERT" "Multiple consecutive errors - system may be down!"
    fi

    # Show summary every 50 checks
    if [ $((check_count % 50)) -eq 0 ]; then
        show_summary
    fi

    # Wait before next check
    sleep "$MONITOR_INTERVAL"
done
