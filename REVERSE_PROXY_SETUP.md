# Reverse Proxy Setup for External Access

## Problem
The external URL `http://paperclip-fulb.srv928136.hstgr.cloud` was unreachable because no reverse proxy was configured to route port 80 traffic to the internal services.

## Solution
Added nginx reverse proxy configuration to forward external traffic to the appropriate internal ports:
- Port 80 → Port 3100 (Paperclip)

## Files Created
1. **nginx.conf** - Nginx configuration for reverse proxy
2. **docker-compose.reverse-proxy.yml** - Docker Compose config for nginx container

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start the reverse proxy
docker compose -f docker-compose.reverse-proxy.yml up -d

# Verify it's running
docker compose -f docker-compose.reverse-proxy.yml ps

# Check logs
docker compose -f docker-compose.reverse-proxy.yml logs -f nginx
```

### Option 2: Using System Nginx

If you have nginx installed on the host:

```bash
# Copy the configuration
sudo cp nginx.conf /etc/nginx/sites-available/paperclip

# Enable the site
sudo ln -s /etc/nginx/sites-available/paperclip /etc/nginx/sites-enabled/

# Test the configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Verification

After starting the reverse proxy, test the external URL:

```bash
# From anywhere
curl http://paperclip-fulb.srv928136.hstgr.cloud

# Should return the Paperclip app HTML (not connection refused)
```

## Troubleshooting

### Port 80 already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# If needed, stop the conflicting service
```

### Service not accessible
```bash
# Check if internal services are running
curl http://127.0.0.1:3100  # Should work
curl http://127.0.0.1:3000  # Should work

# Check nginx logs
docker compose -f docker-compose.reverse-proxy.yml logs nginx
```

### Update nginx configuration
```bash
# After editing nginx.conf
docker compose -f docker-compose.reverse-proxy.yml restart nginx
```

## For Production

Consider adding:
1. **SSL/TLS**: Use Certbot with Let's Encrypt for HTTPS
2. **Rate limiting**: Protect against abuse
3. **Caching**: Improve performance
4. **Firewall rules**: Restrict access if needed

### Adding HTTPS (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d paperclip-fulb.srv928136.hstgr.cloud
```

## Architecture

```
External Request (port 80)
    ↓
Nginx Reverse Proxy
    ↓
Paperclip App (port 3100)
```
