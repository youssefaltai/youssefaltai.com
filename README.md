# Youssef's App Suite

A production-ready Turborepo monorepo containing multiple Next.js applications with shared packages, Docker containerization, and Traefik routing.

## 📋 Architecture

### Apps
- **finance** (`finance.youssefaltai.com`) - Personal finance management
- **fitness** (`fitness.youssefaltai.com`) - Fitness tracking application
- **dashboard** (`dashboard.youssefaltai.com`) - Unified dashboard

### Shared Packages
- **@repo/ui** - Shared UI components and design system
- **@repo/auth** - JWT authentication with shared middleware
- **@repo/utils** - Utility functions and helpers
- **@repo/config** - Shared ESLint and Prettier configurations
- **@repo/tsconfig** - Base TypeScript configurations

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- PNPM >= 9.0.0
- Docker & Docker Compose (for containerized deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and set JWT_SECRET (generate with: openssl rand -base64 32)
```

### Development

```bash
# Run all apps in parallel
pnpm dev

# Run specific app
pnpm dev --filter=finance

# Run multiple apps
pnpm dev --filter=finance --filter=fitness

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=finance
```

## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Start specific service
docker-compose up finance

# Access applications:
# - finance.localhost
# - fitness.localhost
# - dashboard.localhost
# - Traefik dashboard: localhost:8080
```

### Production Deployment

1. **Set environment variables:**
   ```bash
   export JWT_SECRET="your-production-secret"
   export DATABASE_URL="your-database-url"  # Optional
   ```

2. **Update DNS records:**
   Point your subdomains to your server's IP:
   - finance.youssefaltai.com → YOUR_SERVER_IP
   - fitness.youssefaltai.com → YOUR_SERVER_IP
   - dashboard.youssefaltai.com → YOUR_SERVER_IP

3. **Enable SSL (Let's Encrypt):**
   Uncomment the Let's Encrypt lines in `docker-compose.yml`:
   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
   - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
   - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
   ```

4. **Deploy:**
   ```bash
   docker-compose up -d --build
   ```

### Independent App Deployment

Each app can be deployed independently:

```bash
# Build specific app
docker build -f apps/finance/Dockerfile -t finance-app .

# Run
docker run -p 3000:3000 \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV=production \
  finance-app
```

## 🔐 Authentication

All apps share JWT-based authentication via `@repo/auth`.

### Usage Example

**1. Implement login page:**
```typescript
// apps/your-app/app/login/page.tsx
import { Button } from '@repo/ui'
// See apps/finance/app/login/page.tsx for full implementation
```

**2. Create API route:**
```typescript
// apps/your-app/app/api/auth/login/route.ts
import { generateToken, setAuthCookie } from '@repo/auth'
// See apps/finance/app/api/auth/login/route.ts for implementation
```

**3. Add middleware:**
```typescript
// apps/your-app/middleware.ts
import { authMiddleware } from '@repo/auth'
export const middleware = authMiddleware
export const config = { matcher: [/* protected routes */] }
```

### Shared Secret

All apps use the same `JWT_SECRET` environment variable, allowing:
- Single sign-on across all applications
- Token validation works on any app
- Seamless user experience across subdomains

## 🎨 PWA Configuration

Each app is configured as a Progressive Web App with:
- Native Next.js 15 manifest support
- Offline capabilities
- Installable on mobile and desktop

### Adding PWA Icons

For each app, create icons in the `public` directory:

```bash
# Generate icons (192x192 and 512x512)
# Place in apps/[app-name]/public/
- icon-192.png
- icon-512.png
```

Recommended tool: [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

## 📦 Adding New Apps

```bash
# Create new Next.js app
cd apps
pnpm create next-app@latest my-app --typescript --tailwind --app --no-src-dir

# Add shared dependencies
cd ..
pnpm add '@repo/ui@workspace:*' '@repo/auth@workspace:*' '@repo/utils@workspace:*' '@repo/tsconfig@workspace:*' '@repo/config@workspace:*' --filter my-app

# Update tsconfig.json to extend shared config
# Create Dockerfile (copy from existing apps)
# Add service to docker-compose.yml
# Configure PWA manifest
```

## 📦 Adding Shared Packages

```bash
# Create package directory
mkdir packages/my-package && cd packages/my-package

# Initialize
pnpm init
pnpm pkg set name="@repo/my-package" version="0.0.0" private=true

# Add TypeScript
pnpm add -D '@repo/tsconfig@workspace:*' typescript --filter @repo/my-package

# Create src/index.ts and tsconfig.json
```

## 🏗️ Project Structure

```
.
├── apps/
│   ├── finance/          # Finance app
│   ├── fitness/          # Fitness app
│   └── dashboard/        # Dashboard app
├── packages/
│   ├── ui/              # UI components
│   ├── auth/            # Authentication
│   ├── utils/           # Utilities
│   ├── config/          # ESLint & Prettier
│   └── tsconfig/        # TypeScript configs
├── docker-compose.yml   # Orchestration
├── turbo.json          # Turborepo config
├── pnpm-workspace.yaml # PNPM workspace
└── package.json        # Root package
```

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Package Manager:** PNPM with workspaces
- **Build System:** Turborepo
- **Styling:** Tailwind CSS
- **Authentication:** JWT with jose
- **Containerization:** Docker multi-stage builds
- **Reverse Proxy:** Traefik v3
- **Linting:** ESLint
- **Formatting:** Prettier

## 🔧 Turborepo Tasks

- **`build`**: Build all apps (with dependency graph)
- **`dev`**: Run all apps in development mode
- **`lint`**: Lint all packages
- **`type-check`**: TypeScript type checking
- **`clean`**: Clean build outputs

### Task Caching

Turborepo automatically caches task outputs. To clear cache:
```bash
pnpm turbo clean
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run tests for specific package
pnpm test --filter @repo/utils
```

## 📝 Code Quality

### Linting

```bash
# Lint all code
pnpm lint

# Lint specific package
pnpm lint --filter @repo/ui

# Fix lint errors
pnpm lint --fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format all files
pnpm format
```

### Type Checking

```bash
# Type check all packages
pnpm type-check

# Type check specific app
pnpm type-check --filter finance
```

## 🚀 Performance

### Build Optimization

- **Standalone Output:** Next.js standalone mode reduces Docker image size by ~70%
- **Multi-stage Builds:** Separate dependency, build, and runtime stages
- **Layer Caching:** Docker layers optimized for maximum cache hits
- **Turborepo Caching:** Build artifacts cached and reused across builds

### Runtime Optimization

- **Console Removal:** Production builds automatically remove console logs
- **Code Splitting:** Automatic code splitting by Next.js
- **Image Optimization:** Next.js Image component with automatic optimization

## 🔒 Security

- **HTTP-only Cookies:** JWT stored in HTTP-only cookies (XSS protection)
- **CSRF Protection:** SameSite cookie policy
- **Non-root User:** Docker containers run as non-root user
- **Environment Variables:** Secrets managed via environment variables
- **TypeScript Strict Mode:** Catch potential errors at compile time

## 📚 Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PNPM Documentation](https://pnpm.io)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm type-check`
4. Test your changes locally
5. Submit a pull request

## 📄 License

Private - All Rights Reserved

---

Built with ❤️ using modern tooling and best practices.

