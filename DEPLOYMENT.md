# 🚀 VPS Deployment Guide

Complete guide to deploy your Turborepo monorepo to a VPS with Docker and Traefik.

---

## 📋 Prerequisites

**On Your VPS:**
- Ubuntu 22.04+ (or similar Linux distro)
- Docker & Docker Compose installed
- DNS records configured
- SSH access

**DNS Records (Point to your VPS IP):**
```
A     finance.youssef.dev    → YOUR_VPS_IP
A     fitness.youssef.dev    → YOUR_VPS_IP
A     dashboard.youssef.dev  → YOUR_VPS_IP
```

---

## 🔧 Step 1: Prepare Your VPS

### Install Docker (if not installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Install Git

```bash
sudo apt install git -y
```

---

## 📦 Step 2: Deploy to VPS

### Clone Repository

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Clone your repository
git clone https://github.com/yourusername/youssefaltai.com.git
cd youssefaltai.com
```

*Or use SCP/rsync to transfer files:*

```bash
# From your local machine
rsync -avz --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  /Users/youssef/Work/Personal/MyWebsite/youssefaltai.com/ \
  your-user@your-vps-ip:~/youssefaltai.com/
```

---

## 🔐 Step 3: Configure Environment Variables

### Create Production .env

```bash
# On your VPS
cd ~/youssefaltai.com

# Generate a secure JWT secret
export JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}

# Optional: Database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
EOF

# Secure the .env file
chmod 600 .env
```

---

## 🌐 Step 4: Enable SSL with Let's Encrypt

### Update docker-compose.yml

Uncomment Let's Encrypt lines in `docker-compose.yml`:

```yaml
traefik:
  command:
    - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
  volumes:
    - ./letsencrypt:/letsencrypt
```

And for each app, uncomment:

```yaml
labels:
  - "traefik.http.routers.finance.tls.certresolver=letsencrypt"
```

### Create letsencrypt directory

```bash
mkdir -p letsencrypt
chmod 700 letsencrypt
```

---

## 🚀 Step 5: Build and Deploy

### Build Docker Images

```bash
# Build all images (this may take 5-10 minutes)
docker compose build --no-cache

# Verify images were built
docker images | grep youssefaltai
```

### Start Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Verify Deployment

**Check if services are running:**
```bash
docker compose ps
```

**Check app logs:**
```bash
docker compose logs finance
docker compose logs fitness
docker compose logs dashboard
```

**Test endpoints:**
```bash
curl -I https://finance.youssef.dev
curl -I https://fitness.youssef.dev
curl -I https://dashboard.youssef.dev
```

---

## 🔍 Step 6: Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f finance

# Last 100 lines
docker compose logs --tail=100 finance
```

### Check Container Status

```bash
# List running containers
docker compose ps

# Container resource usage
docker stats

# Traefik dashboard
# Visit: http://your-vps-ip:8080
# ⚠️ Disable in production or secure it!
```

---

## 🔄 Step 7: Updates and Maintenance

### Update Application

```bash
# SSH into VPS
cd ~/youssefaltai.com

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Or rebuild specific app
docker compose up -d --build finance
```

### Rebuild Single App

```bash
# Stop app
docker compose stop finance

# Rebuild
docker compose build finance

# Start
docker compose up -d finance
```

### Clean Docker Cache

```bash
# Remove unused images
docker image prune -a

# Remove all stopped containers
docker container prune

# Remove all unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🛡️ Security Best Practices

### 1. Secure Traefik Dashboard

**Option A: Disable it**
```yaml
# Remove from docker-compose.yml
- "--api.insecure=true"
- "8080:8080"  # Remove this port
```

**Option B: Add authentication**
```yaml
- "--api.dashboard=true"
- "--api.insecure=false"
# Add basic auth labels
```

### 2. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 3. Regular Updates

```bash
# Update Docker images regularly
docker compose pull
docker compose up -d

# System updates
sudo apt update && sudo apt upgrade -y
```

### 4. Backup Strategy

```bash
# Backup .env file
cp .env .env.backup

# Backup Let's Encrypt certificates
tar -czf letsencrypt-backup.tar.gz letsencrypt/

# Backup database (if using one)
# docker exec postgres pg_dump -U user dbname > backup.sql
```

---

## 📊 Resource Requirements

**Minimum VPS Specs:**
- **CPU:** 2 cores
- **RAM:** 2GB (4GB recommended)
- **Storage:** 20GB
- **Bandwidth:** 1TB/month

**Recommended VPS Specs:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 40GB SSD
- **Bandwidth:** Unlimited

---

## 🐛 Troubleshooting

### App Not Accessible

```bash
# Check if containers are running
docker compose ps

# Check logs
docker compose logs finance

# Check Traefik routing
docker compose logs traefik

# Verify DNS
nslookup finance.youssef.dev
```

### SSL Certificate Issues

```bash
# Check Let's Encrypt logs
docker compose logs traefik | grep acme

# Ensure ports 80/443 are open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Check acme.json permissions
ls -la letsencrypt/acme.json
```

### Environment Variables Not Loading

```bash
# Verify .env exists
cat .env

# Check Docker Compose picks it up
docker compose config | grep JWT_SECRET

# Restart services
docker compose down
docker compose up -d
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart specific service
docker compose restart finance

# Increase swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🔄 CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/youssefaltai.com
            git pull origin main
            docker compose down
            docker compose build --no-cache
            docker compose up -d
```

---

## 📞 Support

**Common Commands:**

```bash
# Restart all services
docker compose restart

# Stop all services
docker compose down

# View real-time logs
docker compose logs -f

# Check disk usage
docker system df

# Rebuild everything
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## ✅ Post-Deployment Checklist

- [ ] All apps accessible via HTTPS
- [ ] SSL certificates auto-renewing
- [ ] Environment variables secure
- [ ] Firewall configured
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place
- [ ] DNS records correct
- [ ] Traefik dashboard secured/disabled

---

**🎉 Your monorepo is now deployed!**

Visit your apps:
- https://finance.youssef.dev
- https://fitness.youssef.dev
- https://dashboard.youssef.dev

