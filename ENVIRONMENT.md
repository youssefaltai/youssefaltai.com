# Environment Variables Configuration

## 📋 **Required Variables**

Create a `.env` file in the project root with these variables:

```bash
# Database Configuration
# Local dev: use localhost
# Docker containers: SERVICE NAME is used via docker-compose override
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/youssefaltai?schema=public"

# Redis Configuration  
# Local dev: use localhost
# Docker containers: SERVICE NAME is used via docker-compose override
REDIS_URL="redis://localhost:6379"

# JWT Secret (generate a secure random string)
# Use a strong random value in production
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Environment
NODE_ENV="development"

# PostgreSQL Configuration (used by docker-compose)
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YOUR_PASSWORD"
POSTGRES_DB="youssefaltai"
```

---

## 🔧 **Configuration by Environment**

### **Local Development**
```bash
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-change-in-production"
NODE_ENV="development"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="166288"
POSTGRES_DB="youssefaltai"
```

### **Production (VPS)**
```bash
DATABASE_URL="postgresql://postgres:166288@localhost:5432/youssefaltai?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="GENERATE_STRONG_RANDOM_SECRET_HERE"
NODE_ENV="production"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="166288"
POSTGRES_DB="youssefaltai"
```

**Note**: In production, `docker-compose.yml` overrides `DATABASE_URL` and `REDIS_URL` for containers to use service names (`postgres`, `redis`) instead of `localhost`.

---

## 🔒 **Security Notes**

1. **Never commit `.env` files** - They're gitignored for security
2. **Use different secrets** for dev and production
3. **Generate JWT_SECRET** with: `openssl rand -base64 32`
4. **Rotate secrets** periodically in production
5. **Use strong database passwords** in production

---

## 🐳 **Docker Container Environment**

Containers get environment variables from two sources:

1. **`.env` file** - Default values
2. **`docker-compose.yml`** - Override for container-specific values

Example override in `docker-compose.yml`:
```yaml
finance:
  environment:
    - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/youssefaltai
    - REDIS_URL=redis://redis:6379
```

This allows:
- Host commands (`pnpm db:push`) to use `localhost`
- Containers to use service names (`postgres`, `redis`)

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
