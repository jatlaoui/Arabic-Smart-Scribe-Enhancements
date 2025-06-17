# Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Domain name configured (for HTTPS)
- SSL certificates (Let's Encrypt recommended)

## Step-by-Step Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Setup
```bash
# Clone repository
git clone <your-repo> arabic-smart-scribe
cd arabic-smart-scribe

# Setup environment
cp .env.example .env
nano .env  # Configure with production values

# Setup secrets
mkdir -p secrets/
echo "YOUR_GEMINI_KEY" > secrets/gemini_api_key.txt
echo "YOUR_YOUTUBE_KEY" > secrets/youtube_api_key.txt
echo "YOUR_OPENAI_KEY" > secrets/openai_api_key.txt
chmod 600 secrets/*
```

### 3. SSL Setup (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*
```

### 4. Deploy
```bash
# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### 5. Monitoring
```bash
# View logs
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f celery

# Check health
curl http://localhost/health
```

## Production Optimizations

### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql
EOF
chmod +x backup.sh

# Setup cron job
crontab -e
# Add: 0 2 * * * /path/to/arabic-smart-scribe/backup.sh
```

### Log Rotation
```bash
# Configure Docker log rotation
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker
```

### Security Hardening
```bash
# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Setup fail2ban (optional)
sudo apt install fail2ban
```

## Maintenance

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Scaling Celery Workers
```bash
# Scale up workers
docker-compose up -d --scale celery=3

# Scale down
docker-compose up -d --scale celery=1
```

### Database Migrations
```bash
# Run migrations
docker-compose exec app alembic upgrade head
```
