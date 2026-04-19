# VisionMetadata Pro Production Deployment Guide

This folder contains deployment configuration files for running VisionMetadata Pro in production.

## What's included

- `nginx/visionmeta.conf` — Nginx server configuration (reverse proxy + static serving)

## Quick Start (Linux with Nginx)

### 1. Prepare your domain and SSL certificates

```bash
# Example using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 2. Edit the Nginx config

```bash
# Copy the example config
sudo cp nginx/visionmeta.conf /etc/nginx/sites-available/visionmeta.conf

# Edit it to match your domain and certificate paths
sudo nano /etc/nginx/sites-available/visionmeta.conf
```

Replace:
- `example.com` → your domain
- `/etc/letsencrypt/live/example.com/...` → your actual cert paths  
- `/var/www/visionmeta/dist` → where your frontend build is deployed

### 3. Enable the site and test Nginx

```bash
# Create a symlink to enable the site
sudo ln -s /etc/nginx/sites-available/visionmeta.conf /etc/nginx/sites-enabled/visionmeta.conf

# Remove the default site if needed
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Build and deploy frontend

```bash
# At project root
npm install
npm run build

# Copy to web root
sudo mkdir -p /var/www/visionmeta
sudo cp -r dist/* /var/www/visionmeta/dist/
sudo chown -R www-data:www-data /var/www/visionmeta
```

### 5. Build and run backend

```bash
cd server
npm install --production
npm run build

# Option A: Manual start
NODE_ENV=production PORT=4000 node build/index.js

# Option B: Use PM2 (recommended for auto-restart)
npm install -g pm2
pm2 start build/index.js --name visionmeta --env production
pm2 startup systemd -u $(whoami) --hp $(pwd)
pm2 save
```

### 6. Verify it's working

```bash
curl https://yourdomain.com/api/download/latest -I
# Should return: HTTP 200 (file stream begins)

curl -X POST https://yourdomain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
# Should return: {"success":true}
```

## Environment Variables

Set these in your shell before running the server:

- `NODE_ENV=production` — enables frontend static serving
- `PORT=4000` — server port (default 4000; change if using different port in Nginx)
- `DOWNLOAD_URL` — (optional) override the installer download URL

## Logs

- Access logs: `/var/log/nginx/visionmeta.access.log`
- Error logs: `/var/log/nginx/visionmeta.error.log`
- Server logs: `/server/logs/downloads.log` and `/server/logs/contacts.log`

Consider setting up log rotation to prevent disk bloat:

```bash
# /etc/logrotate.d/visionmeta
/var/log/nginx/visionmeta.*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 www-data adm
  reload-on-rotate
  sharedscripts
}
```

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Nginx server runs as unprivileged user (www-data)
- [ ] Backend process runs as unprivileged user
- [ ] `/server/logs` directory is NOT world-readable
- [ ] `.env` files are NOT committed to git
- [ ] Rate limiting enabled in Nginx config
- [ ] Security headers set in Nginx config

## Troubleshooting

**502 Bad Gateway**
- Check if backend is running: `ps aux | grep node`
- Check backend logs for errors
- Verify Nginx proxy_pass points to correct backend port

**Files downloading from browser instead of redirects**
- Verify backend is receiving requests (check logs)
- Check `Content-Disposition` header in server response

**Contact form submissions not logging**
- Verify `/server/logs` directory exists and is writable
- Check backend logs for error messages

## Next Steps

- Consider adding a `.service` file for systemd auto-start
- Set up monitoring/alerting (Uptime Kuma, Grafana, etc.)
- Automate SSL renewal with Let's Encrypt hooks
- Use a CDN for static assets (CloudFlare, AWS CloudFront, etc.)
