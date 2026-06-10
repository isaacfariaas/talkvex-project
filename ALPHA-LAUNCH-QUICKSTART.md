# 🚀 Alpha Launch Monitoring - Quick Start

## Start Monitoring NOW

```bash
# Production monitoring
BASE_URL=https://talkvex.com ./scripts/monitor-alpha-launch.sh

# Local monitoring
./scripts/monitor-alpha-launch.sh
```

## Stop Monitoring

Press `Ctrl+C` - you'll get an automatic summary

## Generate Report

```bash
./scripts/analyze-monitoring-logs.sh
```

## What You'll See

```
✓ OK    Health: ok | DB: ok | Response: 145ms | HTTP: 200  ← All good
⚠ SLOW  Health: ok | DB: ok | Response: 2150ms | HTTP: 200 ← Working but slow
✗ FAIL  Health: error | DB: error | Response: 356ms | HTTP: 503 ← Problem!
🚨 ALERT: 3 consecutive errors detected! ← Critical issue
```

## Key Metrics

- **Green (✓)**: System healthy
- **Yellow (⚠)**: Slow but working
- **Red (✗)**: Failing
- **🚨 Alert**: Multiple failures - investigate immediately!

## Logs Location

All monitoring data is saved in:
- `logs/monitoring/alpha-launch-YYYYMMDD.log` - Detailed logs
- `logs/monitoring/metrics-YYYYMMDD.json` - Raw metrics data
- `logs/monitoring/monitoring-report-*.txt` - Generated reports

## Customize Settings

```bash
# Check every 10 seconds (faster)
MONITOR_INTERVAL=10 ./scripts/monitor-alpha-launch.sh

# Alert on responses slower than 1 second
ALERT_THRESHOLD_MS=1000 ./scripts/monitor-alpha-launch.sh

# Combine settings
MONITOR_INTERVAL=15 ALERT_THRESHOLD_MS=1500 BASE_URL=https://talkvex.com ./scripts/monitor-alpha-launch.sh
```

## Health Check (Manual)

```bash
curl http://localhost:3000/api/health
# or
curl https://talkvex.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "ok",
  "version": "0.1.0",
  "timestamp": "2026-06-10T20:00:00.000Z"
}
```

## Troubleshooting

### "Connection refused"
→ Server is not running. Start it with `npm run dev` or `npm start`

### "Command not found"
→ Run from project root directory

### No metrics in report
→ Install jq: `npm install -g jq` or `apt-get install jq`

## During Alpha Launch

1. **Start monitoring** before the launch
2. **Keep terminal visible** to catch alerts
3. **Generate reports** every hour
4. **Document incidents** as they happen
5. **Stop monitoring** after launch window

## Target Metrics (Alpha)

- ✅ Uptime: > 99%
- ✅ Response time P95: < 1000ms
- ✅ Response time P99: < 2000ms
- ✅ Error rate: < 1%

## Need More Info?

See `docs/MONITORING.md` for complete documentation.
