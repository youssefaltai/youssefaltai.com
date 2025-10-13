# Environment Variables Configuration

## 📋 **Overview**

This monorepo uses **environment-specific configuration files**:
- **Root `.env`** - Shared defaults (JWT, Postgres config)
- **Root `.env.development`** - Local dev (localhost URLs)
- **Root `.env.production`** - Production (Docker service names)
- **App `.env.production`** - App-specific production variables (API keys, URLs)

This cleanly separates local development (localhost) from production (container names) and follows Next.js conventions.

## 🗂️ **File Structure**

```
root/
├─ .env                         # Shared defaults
├─ .env.development            # Local dev (DATABASE_URL with localhost)
├─ .env.production             # Production (DATABASE_URL with postgres)
├─ .env.example                # Template
├─ .env.development.example    # Template
├─ .env.production.example     # Template
├─ apps/
│  ├─ finance/
│  │  ├─ .env.production       # APP_URL, GOLD_API_KEY, RESEND_API_KEY
│  │  └─ .env.production.example
│  ├─ fitness/
│  │  ├─ .env.production       # APP_URL, RESEND_API_KEY
│  │  └─ .env.production.example
│  └─ dashboard/
│     ├─ .env.production       # APP_URL, RESEND_API_KEY
│     └─ .env.production.example
```

## 🚀 **Setup**

### 1. Root Environment Variables

Copy the example files:
```bash
# Shared defaults
cp .env.example .env

# Local development (localhost)
cp .env.development.example .env.development

# Production (Docker service names)
cp .env.production.example .env.production
```

Edit with your values:

**`.env` (shared defaults):**
```bash
JWT_SECRET="generate-with-openssl-rand-base64-32"
NODE_ENV="development"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YOUR_PASSWORD"
POSTGRES_DB="youssefaltai"
```

**`.env.development` (local dev):**
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
```

**`.env.production` (production/Docker):**
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@postgres:5432/youssefaltai?schema=public"
REDIS_URL="redis://redis:6379"
```

### 2. App-Specific Environment Variables (Production Only)

Copy and edit each app's production `.env` file:

**Finance:**
```bash
cp apps/finance/.env.production.example apps/finance/.env.production
# Edit apps/finance/.env.production
```

**Fitness:**
```bash
cp apps/fitness/.env.production.example apps/fitness/.env.production
# Edit apps/fitness/.env.production
```

**Dashboard:**
```bash
cp apps/dashboard/.env.production.example apps/dashboard/.env.production
# Edit apps/dashboard/.env.production
```

---

## 🔧 **Configuration by Environment**

### **Local Development**

**Root `.env` (shared defaults):**
```bash
JWT_SECRET="dev-secret-change-in-production"
NODE_ENV="development"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="166288"
POSTGRES_DB="youssefaltai"
```

**Root `.env.development` (local connections):**
```bash
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
```

**App `.env` files (optional for local dev):**
- Not typically needed for local development
- `APP_URL` not required locally (auto-converts `localhost` → `youssefaltai.local`)
- API keys can be set per-app if testing external services

### **Production (Docker)**

**Root `.env` (shared defaults):**
```bash
JWT_SECRET="GENERATE_STRONG_RANDOM_SECRET_HERE"
NODE_ENV="production"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="166288"
POSTGRES_DB="youssefaltai"
```

**Root `.env.production` (Docker service names):**
```bash
DATABASE_URL="postgresql://postgres:166288@postgres:5432/youssefaltai?schema=public"
REDIS_URL="redis://redis:6379"
```

**App production files:**

`apps/finance/.env.production`:
```bash
APP_URL="https://finance.youssefaltai.com"
GOLD_API_KEY="your-production-key"
RESEND_API_KEY="your-production-key"
```

`apps/fitness/.env.production`:
```bash
APP_URL="https://fitness.youssefaltai.com"
RESEND_API_KEY="your-production-key"
```

`apps/dashboard/.env.production`:
```bash
APP_URL="https://dashboard.youssefaltai.com"
RESEND_API_KEY="your-production-key"
```

---

## 🔒 **Security Notes**

1. **Never commit `.env` files** - They're gitignored for security
2. **Use different secrets** for dev and production
3. **Generate JWT_SECRET** with: `openssl rand -base64 32`
4. **Rotate secrets** periodically in production
5. **Use strong database passwords** in production

---

## 🔄 **How Environment Variables Load**

### **Development (`pnpm dev`)**

**Loading order:**
1. `next.config.ts` loads root `.env` (shared defaults)
2. `next.config.ts` loads root `.env.development` (localhost URLs - overrides)
3. Next.js auto-loads `apps/[app]/.env` (if exists)
4. Next.js auto-loads `apps/[app]/.env.development` (if exists)

**Result:** Uses `localhost` for DATABASE_URL and REDIS_URL

**Precedence (highest first):**
1. App-specific `.env.development` (`apps/finance/.env.development`)
2. App-specific `.env` (`apps/finance/.env`)
3. Root `.env.development`
4. Root `.env`

### **Production (Docker)**

**Loading order:**
1. docker-compose loads root `.env` (shared defaults)
2. docker-compose loads root `.env.production` (container service names - overrides)
3. docker-compose loads `apps/[app]/.env.production` (app-specific)
4. Inline `environment` vars: `NODE_ENV=production`

**Example from `docker-compose.yml`:**
```yaml
finance:
  env_file:
    - .env                        # Shared defaults
    - .env.production             # Production database URLs
    - apps/finance/.env.production # App-specific production
  environment:
    - NODE_ENV=production         # Ensures .env.production is used
```

**Result:** Uses `postgres` and `redis` service names for connections

**Precedence (highest first):**
1. Docker inline `environment` variables
2. App-specific `.env.production` (`apps/finance/.env.production`)
3. Root `.env.production`
4. Root `.env`

## 🐳 **Docker Environment Details**

**Why environment-specific files?**
- **Solves the localhost vs container name problem**
  - `.env.development` has `DATABASE_URL` with `localhost` for local dev
  - `.env.production` has `DATABASE_URL` with `postgres` for Docker
- **Clean separation** - dev and prod configs don't interfere
- **Standard practice** - follows Next.js and 12-factor app conventions

**What gets loaded where:**

| Context | Files Loaded | DATABASE_URL Points To |
|---------|--------------|------------------------|
| Local dev (`pnpm dev`) | `.env` + `.env.development` | `localhost` |
| Host commands (`pnpm db:push`) | `.env` + `.env.development` | `localhost` |
| Docker container | `.env` + `.env.production` + `apps/[app]/.env.production` | `postgres` |

**Key benefit:** No manual overrides needed - the environment automatically picks the right config!

---

## ✅ **Verification**

Check your configuration is correct:

```bash
# Local: Check services are running
docker compose ps

# Local: Test database connection
pnpm db:generate

# Local: Test Redis connection
docker exec redis redis-cli ping
# Should return: PONG

# Production: Same checks on VPS
```
