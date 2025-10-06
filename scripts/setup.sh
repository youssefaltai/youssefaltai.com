#!/bin/bash

# Setup script for Turborepo monorepo
# Generates environment variables and initial configuration

set -e

echo "🚀 Setting up Turborepo monorepo..."
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists. Skipping..."
else
  echo "📝 Creating .env file..."
  
  # Generate JWT secret
  JWT_SECRET=$(openssl rand -base64 32)
  
  cat > .env << EOF
# Environment Variables
# Generated on $(date)

# Shared JWT secret for authentication across all apps
JWT_SECRET=${JWT_SECRET}

# Database URL (if using Prisma)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Node environment
NODE_ENV=development
EOF

  echo "✅ .env file created with generated JWT_SECRET"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm dev' to start all apps (dotenv-cli loads .env automatically)"
echo "  2. Or run 'pnpm dev --filter=finance' for a specific app"
echo "  3. For Docker: 'docker-compose up --build'"
echo ""
echo "📚 Read README.md for full documentation"
echo ""
echo "Note: Environment variables are loaded from root .env via dotenv-cli"

