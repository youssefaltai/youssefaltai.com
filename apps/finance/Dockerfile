# Finance App Dockerfile
# Multi-stage build optimized for Next.js standalone output

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files (explicit for better layer caching)
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/
COPY packages/types/package.json ./packages/types/
COPY packages/tailwind-config/package.json ./packages/tailwind-config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/providers/package.json ./packages/providers/
COPY apps/finance/package.json ./apps/finance/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy entire workspace from deps (includes all node_modules and PNPM structure)
COPY --from=deps /app ./

# Copy source files (override package.json copies with actual source)
COPY . .

# Generate Prisma Client with correct binaries for Alpine
RUN cd packages/db && pnpm prisma generate && cd ../..

# Build the app using Turborepo
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=finance

# Stage 3: Runner (minimal production image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/finance/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/finance/.next/static ./apps/finance/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/finance/public ./apps/finance/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/finance/server.js"]

