# 🚀 VPS Deployment Checklist

Quick reference for deploying to your VPS.

---

## ✅ Pre-Deployment Checklist

### **1. DNS Configuration**
- [ ] Point `finance.youssefaltai.com` → VPS IP
- [ ] Point `fitness.youssefaltai.com` → VPS IP
- [ ] Point `dashboard.youssefaltai.com` → VPS IP
- [ ] Verify DNS propagation: `nslookup finance.youssefaltai.com`

### **2. VPS Preparation**
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Port 80 open (HTTP)
- [ ] Port 443 open (HTTPS)
- [ ] Port 22 open (SSH)
- [ ] Git installed

### **3. SSL/TLS Setup (Let's Encrypt)**

**Edit `docker-compose.yml` on VPS:**

Uncomment these lines (lines 14-16):
```yaml
- "--certificatesresolvers.letsencrypt.acme.email=YOUR_EMAIL@example.com"
- "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
- "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
```

Uncomment volume (line 24):
```yaml
- ./letsencrypt:/letsencrypt
```

For each app, uncomment (lines 42, 65, 88):
```yaml
- "traefik.http.routers.finance.tls.certresolver=letsencrypt"
- "traefik.http.routers.fitness.tls.certresolver=letsencrypt"
- "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
```

---

## 🚀 Deployment Steps

### **Step 1: Transfer Files to VPS**

**Option A: Git Clone (Recommended)**
```bash
# On VPS
cd ~
git clone https://github.com/YOUR_USERNAME/youssefaltai.com.git
cd youssefaltai.com
```

**Option B: rsync Transfer**
```bash
# From your laptop
rsync -avz --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.git' \
  --exclude '.env' \
  /Users/youssef/Work/Personal/MyWebsite/youssefaltai.com/ \
  user@YOUR_VPS_IP:~/youssefaltai.com/
```

### **Step 2: Environment Variables**

```bash
# On VPS
cd ~/youssefaltai.com

# Generate production JWT secret
export JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
# DATABASE_URL=your_database_url_here
EOF

# Secure it
chmod 600 .env
```

### **Step 3: Enable SSL**

```bash
# On VPS - Edit docker-compose.yml
nano docker-compose.yml

# Uncomment all Let's Encrypt lines (see checklist above)
# Update email address to yours

# Create letsencrypt directory
mkdir -p letsencrypt
chmod 700 letsencrypt
```

### **Step 4: Deploy**

```bash
# Build and start all services
docker compose up -d --build

# Monitor logs
docker compose logs -f
```

### **Step 5: Verify**

```bash
# Check containers
docker compose ps

# Test endpoints
curl -I https://finance.youssefaltai.com
curl -I https://fitness.youssefaltai.com
curl -I https://dashboard.youssefaltai.com

# Check SSL certificates
curl -vI https://finance.youssefaltai.com 2>&1 | grep -i "SSL certificate"
```

---

## 🔄 Updating Deployed Apps

### **Full Update (All Apps)**

```bash
# SSH into VPS
ssh user@your-vps-ip
cd ~/youssefaltai.com

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Monitor
docker compose logs -f
```

### **Update Single App**

```bash
# Pull changes
git pull origin main

# Rebuild specific app
docker compose up -d --build finance

# Or without downtime
docker compose build finance
docker compose up -d --no-deps finance
```

---

## 🛡️ Security Hardening

### **Firewall Setup**

```bash
# Install UFW
sudo apt install ufw

# Allow SSH (IMPORTANT: do this first!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable
sudo ufw enable

# Check status
sudo ufw status
```

### **Secure Traefik Dashboard**

**Option 1: Disable it (Recommended for production)**

Remove from `docker-compose.yml`:
```yaml
# - "--api.insecure=true"  # Comment this out
# - "8080:8080"             # Comment this out
```

**Option 2: Add basic auth (if you need it)**
```bash
# Generate password
htpasswd -nb admin your_password

# Add to docker-compose.yml
labels:
  - "traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$$apr1$$..."
```

### **Automatic Security Updates**

```bash
# Enable unattended upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 Monitoring

### **Check Resource Usage**

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Service logs
docker compose logs finance --tail=100
```

### **Health Checks**

```bash
# Check all apps are responding
curl -f https://finance.youssefaltai.com || echo "Finance down!"
curl -f https://fitness.youssefaltai.com || echo "Fitness down!"
curl -f https://dashboard.youssefaltai.com || echo "Dashboard down!"
```

---

## 🔧 Troubleshooting

### **Containers Not Starting**

```bash
# Check logs
docker compose logs

# Check specific app
docker compose logs finance

# Restart
docker compose restart
```

### **SSL Not Working**

```bash
# Check Let's Encrypt logs
docker compose logs traefik | grep acme

# Verify DNS is pointing correctly
nslookup finance.youssefaltai.com

# Ensure ports are open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### **Out of Disk Space**

```bash
# Clean Docker cache
docker system prune -a --volumes

# Check disk usage
df -h
```

---

## ⚡ Quick Commands

```bash
# Start all
docker compose up -d

# Stop all
docker compose down

# Restart all
docker compose restart

# View logs (all)
docker compose logs -f

# View logs (specific app)
docker compose logs -f finance

# Rebuild everything
docker compose down
docker compose build --no-cache
docker compose up -d

# Check status
docker compose ps
```

---

## 🎯 Post-Deployment

- [ ] All apps accessible via HTTPS
- [ ] SSL certificates working (green padlock)
- [ ] Login/authentication working
- [ ] PWA manifest accessible
- [ ] Traefik dashboard secured/disabled
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backup strategy defined

---

## 📞 Emergency Rollback

```bash
# Stop all services
docker compose down

# Revert to previous commit
git log --oneline  # Find commit hash
git reset --hard PREVIOUS_COMMIT_HASH

# Redeploy
docker compose up -d --build
```

---

**🎉 Your monorepo is production-ready!**

For full details, see `DEPLOYMENT.md`.

