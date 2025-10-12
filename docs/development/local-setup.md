# Local Development Setup

This guide explains how to run the database, Redis, and apps locally.

---

## 🚀 Quick Start

### **1. Start Database & Redis**

```bash
# Start only PostgreSQL and Redis (no apps)
docker compose up -d postgres redis

# Verify services are running
docker compose ps

# Check logs
docker compose logs -f postgres redis
```

### **2. Setup Environment Variables**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values (optional, defaults work for local dev)
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV=development
```

### **3. Push Database Schema**

```bash
# Generate Prisma client and push schema to database
pnpm db:generate
pnpm db:push
```

### **4. Start Development Server**

```bash
# Start Finance app
pnpm dev --filter=finance

# Or start all apps
pnpm dev
```

### **5. HTTPS Development (Optional)**

For testing HTTPS locally (e.g., PWA installation, secure contexts):

**Step 1: Install mkcert**
```bash
# macOS
brew install mkcert

# Linux
sudo apt install mkcert  # Debian/Ubuntu
sudo dnf install mkcert  # Fedora

# Windows (run as Administrator)
choco install mkcert
```

**Step 2: Create local CA and certificates**
```bash
# Install local CA
mkcert -install

# Generate certificates for each app
cd apps/finance/certs
mkcert localhost 127.0.0.1 ::1

cd ../../dashboard/certs
mkcert localhost 127.0.0.1 ::1

cd ../../fitness/certs
mkcert localhost 127.0.0.1 ::1
```

**Step 3: Run with HTTPS**
```bash
# Start app with HTTPS (one at a time, all use port 3000)
pnpm --filter=finance dev:https
pnpm --filter=dashboard dev:https
pnpm --filter=fitness dev:https

# Access at: https://localhost:3000
```

**Note:** All apps use port 3000, so run only one app at a time with HTTPS. For running multiple apps simultaneously with different ports:
```bash
# Finance on 3000
pnpm --filter=finance dev:https

# Dashboard on 3001 (in another terminal)
PORT=3001 pnpm --filter=dashboard dev:https

# Fitness on 3002 (in another terminal)
PORT=3002 pnpm --filter=fitness dev:https
```

---

## 🐳 Docker Compose Services

### **Available Services:**

| Service | Purpose | Port | Command |
|---------|---------|------|---------|
| `postgres` | PostgreSQL database | 5432 | `docker compose up -d postgres` |
| `redis` | Challenge storage | 6379 | `docker compose up -d redis` |
| `finance` | Finance app | 3000 | `docker compose up -d finance` |
| `dashboard` | Dashboard app | 3000 | `docker compose up -d dashboard` |
| `fitness` | Fitness app | 3000 | `docker compose up -d fitness` |
| `traefik` | Reverse proxy | 80/443 | `docker compose up -d traefik` |

---

## 🔧 Common Commands

### **Database & Redis Only (Recommended for Local Dev)**

```bash
# Start
docker compose up -d postgres redis

# Stop
docker compose stop postgres redis

# Restart
docker compose restart postgres redis

# View logs
docker compose logs -f postgres redis

# Stop and remove (WARNING: deletes data)
docker compose down -v
```

### **Database Management**

```bash
# Push schema changes (no migration)
pnpm db:push

# Create migration (production)
pnpm db:migrate

# Open Prisma Studio (GUI)
pnpm db:studio

# Generate Prisma client
pnpm db:generate
```

### **Redis Management**

```bash
# Connect to Redis CLI
docker compose exec redis redis-cli

# Check stored keys
docker compose exec redis redis-cli KEYS "*"

# Flush all data (WARNING: deletes everything)
docker compose exec redis redis-cli FLUSHALL
```

---

## 🏃 Development Workflow

### **Option 1: Docker for DB/Redis, Local for Apps** (⭐ Recommended)

**Pros:**
- ✅ Fast hot-reload
- ✅ Easy debugging
- ✅ Better IDE integration

**Steps:**
```bash
# 1. Start database & Redis
docker compose up -d postgres redis

# 2. Push schema
pnpm db:push

# 3. Start app locally
pnpm dev --filter=finance

# Access at: http://localhost:3000
```

---

### **Option 2: Everything in Docker**

**Pros:**
- ✅ Production-like environment
- ✅ Tests full deployment

**Steps:**
```bash
# Build and start everything
docker compose up -d --build

# Access apps:
# - Finance: http://finance.localhost
# - Dashboard: http://dashboard.localhost
# - Fitness: http://fitness.localhost
# - Traefik Dashboard: http://localhost:8080
```

---

## 🔍 Verifying Services

### **Check PostgreSQL:**
```bash
# Connection test
docker compose exec postgres psql -U postgres -c "SELECT version();"

# List databases
docker compose exec postgres psql -U postgres -c "\l"

# Connect to database
docker compose exec postgres psql -U postgres -d youssefaltai
```

### **Check Redis:**
```bash
# Ping test
docker compose exec redis redis-cli ping
# Expected: PONG

# Check info
docker compose exec redis redis-cli INFO server
```

### **Check App Connectivity:**
```bash
# From your app, test database
pnpm db:studio

# Check Redis connection (from Finance app)
pnpm dev --filter=finance
# Try logging in - challenges are stored in Redis
```

---

## 🛑 Stopping Services

### **Stop but keep data:**
```bash
docker compose stop
```

### **Stop and remove containers (keeps data):**
```bash
docker compose down
```

### **Stop and DELETE all data (⚠️ WARNING):**
```bash
docker compose down -v
```

---

## 📊 Connection Strings

### **Local Development (apps run on host):**
```env
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
```

### **Docker Development (apps run in containers):**
```env
DATABASE_URL="postgresql://postgres:166288@postgres:5432/youssefaltai?schema=public"
REDIS_URL="redis://redis:6379"
```

**Note:** Use **service names** (`postgres`, `redis`) when running apps in Docker, **localhost** when running apps on host.

---

## 🐛 Troubleshooting

### **"Connection refused" errors:**
```bash
# Check if services are running
docker compose ps

# Check logs
docker compose logs postgres redis

# Restart services
docker compose restart postgres redis
```

### **"Database does not exist":**
```bash
# Database is created automatically on first start
# If missing, recreate container:
docker compose down postgres
docker compose up -d postgres
```

### **Port already in use:**
```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill the process or change port in docker-compose.yml
```

### **Prisma client out of sync:**
```bash
pnpm db:generate
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| **Start DB + Redis** | `docker compose up -d postgres redis` |
| **Stop DB + Redis** | `docker compose stop postgres redis` |
| **View logs** | `docker compose logs -f postgres redis` |
| **Push schema** | `pnpm db:push` |
| **Open DB GUI** | `pnpm db:studio` |
| **Start Finance app** | `pnpm dev --filter=finance` |
| **Start with HTTPS** | `pnpm --filter=finance dev:https` |
| **Build all apps** | `pnpm build` |
| **Type-check all** | `pnpm type-check` |

---

## ✅ Checklist

Before starting development:
- [ ] Docker Desktop is installed and running
- [ ] `.env` file exists with correct values
- [ ] PostgreSQL is running: `docker compose ps postgres`
- [ ] Redis is running: `docker compose ps redis`
- [ ] Schema is pushed: `pnpm db:push`
- [ ] Prisma client generated: `pnpm db:generate`
- [ ] Dependencies installed: `pnpm install`

Ready to code! 🚀

