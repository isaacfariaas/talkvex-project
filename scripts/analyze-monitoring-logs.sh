#!/bin/bash
# Analyze monitoring logs and generate a report

set -euo pipefail

LOG_DIR="./logs/monitoring"
REPORT_FILE="${LOG_DIR}/monitoring-report-$(date +%Y%m%d-%H%M%S).txt"

# Check if log directory exists
if [ ! -d "$LOG_DIR" ]; then
    echo "Error: Log directory not found: $LOG_DIR"
    exit 1
fi

# Find the most recent metrics file
METRICS_FILE=$(ls -t "${LOG_DIR}"/metrics-*.json 2>/dev/null | head -n1)
LOG_FILE=$(ls -t "${LOG_DIR}"/alpha-launch-*.log 2>/dev/null | head -n1)

if [ -z "$METRICS_FILE" ] && [ -z "$LOG_FILE" ]; then
    echo "Error: No monitoring data found in $LOG_DIR"
    exit 1
fi

echo "=== Alpha Launch Monitoring Report ===" | tee "$REPORT_FILE"
echo "Generated at: $(date)" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Analyze log file if it exists
if [ -n "$LOG_FILE" ] && [ -f "$LOG_FILE" ]; then
    echo "Log file: $LOG_FILE" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"

    # Count events
    echo "## Event Summary" | tee -a "$REPORT_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"

    total_checks=$(grep -c "Health:" "$LOG_FILE" || echo 0)
    ok_checks=$(grep -c "✓ OK" "$LOG_FILE" || echo 0)
    slow_checks=$(grep -c "⚠ SLOW" "$LOG_FILE" || echo 0)
    fail_checks=$(grep -c "✗ FAIL" "$LOG_FILE" || echo 0)
    errors=$(grep -c "\[ERROR\]" "$LOG_FILE" || echo 0)
    alerts=$(grep -c "\[ALERT\]" "$LOG_FILE" || echo 0)

    echo "Total health checks: ${total_checks}" | tee -a "$REPORT_FILE"
    echo "✓ Successful: ${ok_checks}" | tee -a "$REPORT_FILE"
    echo "⚠ Slow responses: ${slow_checks}" | tee -a "$REPORT_FILE"
    echo "✗ Failed: ${fail_checks}" | tee -a "$REPORT_FILE"
    echo "Errors: ${errors}" | tee -a "$REPORT_FILE"
    echo "Alerts: ${alerts}" | tee -a "$REPORT_FILE"

    # Calculate uptime
    if [ "$total_checks" -gt 0 ]; then
        uptime_pct=$((ok_checks * 100 / total_checks))
        echo "" | tee -a "$REPORT_FILE"
        echo "📊 Uptime: ${uptime_pct}%" | tee -a "$REPORT_FILE"
    fi

    echo "" | tee -a "$REPORT_FILE"
fi

# Analyze metrics file if it exists
if [ -n "$METRICS_FILE" ] && [ -f "$METRICS_FILE" ]; then
    echo "Metrics file: $METRICS_FILE" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"

    # Calculate response time statistics
    if command -v jq &> /dev/null; then
        echo "## Response Time Statistics (ms)" | tee -a "$REPORT_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"

        # Extract response times
        response_times=$(jq -r '.response_time_ms' "$METRICS_FILE" 2>/dev/null | grep -v "null" || echo "")

        if [ -n "$response_times" ]; then
            # Calculate min, max, avg
            min=$(echo "$response_times" | sort -n | head -n1)
            max=$(echo "$response_times" | sort -n | tail -n1)
            count=$(echo "$response_times" | wc -l)
            sum=$(echo "$response_times" | awk '{s+=$1} END {print s}')
            avg=$((sum / count))

            echo "Min: ${min}ms" | tee -a "$REPORT_FILE"
            echo "Max: ${max}ms" | tee -a "$REPORT_FILE"
            echo "Avg: ${avg}ms" | tee -a "$REPORT_FILE"
            echo "" | tee -a "$REPORT_FILE"

            # Calculate p50, p95, p99
            p50_idx=$((count / 2))
            p95_idx=$((count * 95 / 100))
            p99_idx=$((count * 99 / 100))

            p50=$(echo "$response_times" | sort -n | sed -n "${p50_idx}p")
            p95=$(echo "$response_times" | sort -n | sed -n "${p95_idx}p")
            p99=$(echo "$response_times" | sort -n | sed -n "${p99_idx}p")

            echo "P50: ${p50}ms" | tee -a "$REPORT_FILE"
            echo "P95: ${p95}ms" | tee -a "$REPORT_FILE"
            echo "P99: ${p99}ms" | tee -a "$REPORT_FILE"
            echo "" | tee -a "$REPORT_FILE"
        fi

        # HTTP status code distribution
        echo "## HTTP Status Code Distribution" | tee -a "$REPORT_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"
        jq -r '.http_code' "$METRICS_FILE" 2>/dev/null | sort | uniq -c | tee -a "$REPORT_FILE" || echo "N/A"
        echo "" | tee -a "$REPORT_FILE"
    else
        echo "⚠ jq not installed - skipping detailed metrics analysis" | tee -a "$REPORT_FILE"
        echo "" | tee -a "$REPORT_FILE"
    fi
fi

# Show recent errors
if [ -n "$LOG_FILE" ] && [ -f "$LOG_FILE" ]; then
    echo "## Recent Errors (last 10)" | tee -a "$REPORT_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"
    grep "\[ERROR\]" "$LOG_FILE" | tail -n10 | tee -a "$REPORT_FILE" || echo "No errors found" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
fi

# Show recent alerts
if [ -n "$LOG_FILE" ] && [ -f "$LOG_FILE" ]; then
    echo "## Alerts" | tee -a "$REPORT_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"
    grep "\[ALERT\]" "$LOG_FILE" | tee -a "$REPORT_FILE" || echo "No alerts" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$REPORT_FILE"
echo "Report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"
