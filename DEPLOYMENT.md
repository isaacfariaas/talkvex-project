# 🚀 Production Deployment Guide

**Deployment Type**: Simple Test (No SSL)  
**Access**: http://31.97.91.250:3000  
**Generated**: 2026-06-11

## ⚡ Quick Start (For Host Machine)

```bash
# 1. SSH into the server
ssh user@31.97.91.250

# 2. Navigate to this project directory
cd /path/to/this/project

# 3. Get your Anthropic API key
# Visit: https://console.anthropic.com/settings/keys
# Create a new API key and copy it

# 4. Add the API key to .env.production
nano .env.production
# Find the line: ANTHROPIC_API_KEY=""
# Replace with: ANTHROPIC_API_KEY="sk-ant-your-key-here"
# Save and exit (Ctrl+X, Y, Enter)

# 5. Run the deployment script
./deploy-production.sh
```

## 📋 What Was Configured

### ✅ Files Created
- `.env.production` - Production environment variables
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `deploy-production.sh` - Automated deployment script
- `DEPLOYMENT.md` - This documentation

### ✅ Configuration
- **Database**: PostgreSQL 16 running in Docker
- **Application**: Next.js app in standalone mode
- **Port**: 3000 (exposed on host)
- **URL**: http://31.97.91.250:3000
- **NEXTAUTH_SECRET**: Pre-generated secure secret
- **NEXTAUTH_URL**: Configured for IP access

### ⚠️ Still Needed
- **ANTHROPIC_API_KEY**: Must be added to .env.production
  - Get it from: https://console.anthropic.com/settings/keys
  - Required for AI plan generation features
  - Without it, the app will start but AI features won't work

## 📖 Detailed Deployment Steps

### Step 1: Access the Server

```bash
ssh user@31.97.91.250
cd /path/to/this/project
```

### Step 2: Get Anthropic API Key

1. Visit https://console.anthropic.com/
2. Log in or create an account
3. Go to Settings → API Keys
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### Step 3: Configure Environment

Edit `.env.production`:

```bash
nano .env.production
```

Find and update:
```bash
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"
```

Save and exit (Ctrl+X, Y, Enter).

### Step 4: Deploy

Run the deployment script:

```bash
./deploy-production.sh
```

The script will:
- ✅ Stop any existing containers
- ✅ Build the application image
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Start the application
- ✅ Perform health checks

### Step 5: Verify

Once deployment completes, verify:

```bash
# Check if containers are running
docker compose -f docker-compose.prod.yml ps

# Check application health
curl http://localhost:3000/api/health

# View application logs
docker compose -f docker-compose.prod.yml logs -f app
```

Access the app at: **http://31.97.91.250:3000**

## 🔧 Management Commands

### View Logs
```bash
# Follow app logs
docker compose -f docker-compose.prod.yml logs -f app

# Follow all logs
docker compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 app
```

### Restart Application
```bash
# Restart app only (after .env changes)
docker compose -f docker-compose.prod.yml restart app

# Restart everything
docker compose -f docker-compose.prod.yml restart
```

### Stop Application
```bash
# Stop but keep data
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes database!)
docker compose -f docker-compose.prod.yml down -v
```

### Update Application
```bash
# Pull latest code
git pull origin master

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run new migrations if any
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

## 🗄️ Database Management

### Backup Database
```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres metas_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database
```bash
cat backup-YYYYMMDD-HHMMSS.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U postgres metas_db
```

### Access Database Shell
```bash
docker compose -f docker-compose.prod.yml exec db psql -U postgres metas_db
```

## 📊 Monitoring

### Start Monitoring Script
```bash
# From project directory
BASE_URL=http://31.97.91.250:3000 ./scripts/monitor-alpha-launch.sh
```

### Health Check Endpoint
```bash
curl http://31.97.91.250:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "ok",
  "version": "0.1.0",
  "timestamp": "2026-06-11T..."
}
```

## 🐛 Troubleshooting

### Application won't start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Common issues:
# - Database not ready: wait and restart
# - Port 3000 in use: change port in docker-compose.prod.yml
# - Missing migrations: run prisma migrate deploy
```

### Database connection errors
```bash
# Check if database is running
docker compose -f docker-compose.prod.yml ps db

# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Restart database
docker compose -f docker-compose.prod.yml restart db
```

### AI features not working
```bash
# Verify ANTHROPIC_API_KEY is set
docker compose -f docker-compose.prod.yml exec app env | grep ANTHROPIC

# If empty, add key to .env.production and restart:
docker compose -f docker-compose.prod.yml restart app
```

### Port 3000 already in use
Edit `docker-compose.prod.yml` and change:
```yaml
ports:
  - "8080:3000"  # Use port 8080 on host
```

Then update `NEXTAUTH_URL` in `.env.production`:
```bash
NEXTAUTH_URL="http://31.97.91.250:8080"
```

## 🔐 Security Notes

### Current Setup (Test Deployment)
- ⚠️ No HTTPS/SSL (HTTP only)
- ⚠️ Using default PostgreSQL password
- ⚠️ Database port exposed on host (5432)
- ✅ Application isolated in Docker network
- ✅ Secure NEXTAUTH_SECRET generated

### For Production Use
Before public launch, you should:
1. Set up reverse proxy (nginx/Caddy) with SSL
2. Change PostgreSQL password
3. Don't expose database port (5432)
4. Set up automated backups
5. Configure firewall rules
6. Use environment-specific secrets management

## 📝 Next Steps

1. ✅ Add ANTHROPIC_API_KEY to `.env.production`
2. ✅ Run `./deploy-production.sh`
3. ✅ Test the application at http://31.97.91.250:3000
4. ✅ Set up monitoring with `./scripts/monitor-alpha-launch.sh`
5. ⏭️ Configure automated database backups
6. ⏭️ When ready, upgrade to SSL with domain

## 🆘 Support

If you encounter issues:
1. Check logs: `docker compose -f docker-compose.prod.yml logs app`
2. Verify health: `curl http://31.97.91.250:3000/api/health`
3. Review this documentation
4. Check the troubleshooting section above
