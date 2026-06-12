# 🚀 Quick Start - Deploy in 5 Minutes

## For the User (Run on Host Machine)

### Prerequisites
- Access to server: 31.97.91.250
- Anthropic API key from: https://console.anthropic.com/settings/keys

### Steps

```bash
# 1. SSH to server
ssh user@31.97.91.250

# 2. Go to project directory
cd /path/to/this/project

# 3. Edit .env.production and add your ANTHROPIC_API_KEY
nano .env.production
# Find: ANTHROPIC_API_KEY=""
# Change to: ANTHROPIC_API_KEY="sk-ant-your-key"
# Save: Ctrl+X, Y, Enter

# 4. Run deployment
./deploy-production.sh

# 5. Done! Access at:
# http://31.97.91.250:3000
```

## What You Get

- ✅ Full Next.js application running
- ✅ PostgreSQL database with migrations
- ✅ Production environment configured
- ✅ Secure authentication secrets
- ✅ Monitoring scripts ready
- ✅ Management commands documented

## Files Reference

- `DEPLOYMENT.md` - Complete deployment guide
- `.env.production` - Environment configuration
- `docker-compose.prod.yml` - Docker setup
- `deploy-production.sh` - Automated deployment
- `QUICK-START.md` - This file

## Need Help?

See `DEPLOYMENT.md` for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Management commands
- Database backup/restore
- Monitoring setup
