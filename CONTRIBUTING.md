# Contributing to youssefaltai.com

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to this monorepo.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Standards](#project-standards)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Questions & Support](#questions--support)

---

## Code of Conduct

This is a personal project, but we maintain high standards:

- **Be respectful** in all interactions
- **Write clean code** following our standards
- **Document your work** thoroughly
- **Test your changes** before submitting
- **Follow the research-first approach** for new features

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PNPM >= 9.0.0
- Git
- Docker & Docker Compose (optional, for testing deployment)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/youssefaltai.com.git
   cd youssefaltai.com
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your JWT_SECRET
   ```

4. **Run the development server:**
   ```bash
   pnpm dev --filter=finance
   ```

5. **Verify your setup:**
   ```bash
   pnpm type-check
   pnpm lint
   ```

---

## Development Workflow

### 1. Choose What to Work On

- Check existing issues or create a new one
- For new features, discuss the approach first
- For bugs, provide reproduction steps

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### 3. Research First (For New Features)

Before implementing a new feature, create a research document:

1. **Create** `docs/research/feature-name.md`
2. **Follow the template:**
   ```markdown
   # Feature Name - Research
   
   ## Problem Statement
   One sentence description of what you're solving.
   
   ## Candidate Approaches
   1. Approach A - Pros/Cons
   2. Approach B - Pros/Cons
   3. Approach C - Pros/Cons
   
   ## Chosen Approach
   Why this approach was chosen.
   
   ## Implementation Plan
   Step-by-step implementation steps.
   
   ## References
   Links and resources used.
   ```

3. **Get approval** before implementing

### 4. Write Code

Follow our [Development Standards](./docs/development/standards.md):

- **TypeScript strict mode** - No `any` types
- **ESLint & Prettier** - Run `pnpm lint --fix` before committing
- **Component structure** - Follow Next.js 15 App Router patterns
- **Server Components first** - Use `'use client'` only when needed
- **Proper error handling** - Try-catch all async operations
- **Validation** - Use Zod for all API inputs
- **Security** - Always verify user ownership of resources

### 5. Test Your Changes

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Build (ensures no build errors)
pnpm build --filter=your-app

# Test locally
pnpm dev --filter=your-app

# Test with Docker (optional)
docker compose up --build your-app
```

### 6. Commit Your Changes

Use conventional commits format:

```bash
git add .
git commit -m "feat(finance): add transaction filtering"
# or
git commit -m "fix(auth): resolve token expiration issue"
# or
git commit -m "docs(deployment): update VPS setup guide"
```

**Commit prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions
- `chore:` - Build process or auxiliary tool changes

### 7. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

---

## Project Standards

### Code Quality

**Mandatory checks before PR:**
- ✅ `pnpm type-check` passes
- ✅ `pnpm lint` passes with no errors
- ✅ `pnpm build` succeeds
- ✅ No console.log statements (use proper logging)
- ✅ All new code is typed (no `any`)

### File Organization

```
apps/[app-name]/
├── app/
│   ├── api/              # API routes
│   ├── components/       # App-specific components
│   └── (routes)/         # Page routes
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores (client state)
└── middleware.ts         # Auth middleware

packages/
├── ui/                   # Shared components
├── db/                   # Prisma database
├── auth/                 # Authentication
└── utils/                # Utilities
```

### Naming Conventions

- **Files:** `PascalCase.tsx` for components, `kebab-case.ts` for utilities
- **Components:** `PascalCase` - `function TransactionForm()`
- **Hooks:** `camelCase` with `use` prefix - `useTransactions()`
- **Functions:** `camelCase` - `formatCurrency()`
- **Constants:** `UPPER_SNAKE_CASE` - `MAX_TRANSACTIONS`
- **Types/Interfaces:** `PascalCase` - `Transaction`, `UserSettings`

### Adding Dependencies

Use CLI, never edit `package.json` manually:

```bash
# App dependency
pnpm add package-name --filter=app-name

# Shared package dependency
pnpm add package-name --filter=@repo/package-name

# Dev dependency
pnpm add -D package-name --filter=app-name
```

**Before adding a dependency:**
1. Can we use built-in Node/JS/Next features?
2. Is it actively maintained?
3. Does it have TypeScript support?
4. What's the bundle size impact?
5. Are there security vulnerabilities?

### Database Changes

When modifying the database schema:

1. **Update** `packages/db/prisma/schema.prisma`
2. **Generate client:** `pnpm db:generate`
3. **Push to database:** `pnpm db:push` (dev) or create migration (prod)
4. **Test thoroughly** - database changes affect all apps

### API Routes

Follow this structure for all API routes:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const payload = await verifyToken(token)
    
    // 2. Parse and validate input
    const data = CreateSchema.parse(await request.json())
    
    // 3. Verify authorization (user owns resource)
    const resource = await prisma.resource.findFirst({
      where: { id: data.id, userId: payload.id }
    })
    
    // 4. Execute business logic
    const result = await prisma.resource.create({ data })
    
    // 5. Return standardized response
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/resource:', error)
    return NextResponse.json(
      { message: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
```

---

## Pull Request Process

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows [Development Standards](./docs/development/standards.md)
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] All new features have research documents (if applicable)
- [ ] Documentation is updated (README, docs/, inline comments)
- [ ] Commit messages follow conventional commits format
- [ ] PR description is clear and complete

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issues
Fixes #123

## Research Document
Link to research document (for new features): [docs/research/feature-name.md](./docs/research/feature-name.md)

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
Add screenshots here

## Breaking Changes
List any breaking changes and migration steps

## Checklist
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Tested locally
```

### Review Process

1. **Automated checks** run on PR creation
2. **Code review** by maintainer
3. **Feedback** may be provided for changes
4. **Approval** and merge when ready

---

## Documentation

### When to Update Documentation

**Always update documentation when:**
- Adding new features (research + implementation docs)
- Changing architecture or design decisions
- Modifying deployment process
- Adding/removing dependencies
- Changing API contracts
- Updating environment variables

### Documentation Structure

```
docs/
├── README.md                  # Documentation index
├── architecture/              # System design decisions
├── research/                  # Feature research
├── deployment/                # Deployment guides
└── development/               # Development guides
```

### Writing Good Documentation

- **Be clear and concise** - No jargon unless necessary
- **Use examples** - Show real code snippets
- **Include rationale** - Explain WHY, not just WHAT
- **Keep it updated** - Documentation should match code
- **Link related docs** - Help readers navigate

---

## Questions & Support

### Getting Help

1. **Check documentation first:**
   - [Documentation Index](./docs/README.md)
   - [Development Standards](./docs/development/standards.md)
   - [Architecture Docs](./docs/architecture)

2. **Search existing issues** on GitHub

3. **Ask in discussions** (GitHub Discussions)

4. **Create an issue** if you found a bug or have a feature request

### Reporting Bugs

When reporting bugs, include:
- **Description** - What happened vs what you expected
- **Reproduction steps** - How to reproduce the issue
- **Environment** - OS, Node version, PNPM version
- **Logs** - Relevant error messages or logs
- **Screenshots** - If applicable

### Requesting Features

When requesting features:
1. **Check existing issues** first
2. **Describe the problem** you're trying to solve
3. **Propose a solution** (optional)
4. **Explain the benefit** - Why is this needed?
5. **Consider alternatives** - Are there other approaches?

---

## Thank You! 🎉

Your contributions make this project better. We appreciate your time and effort!

**Before you start:**
- ⭐ Star the repository
- 📖 Read the [Development Standards](./docs/development/standards.md)
- 🏗️ Review the [Architecture](./docs/architecture/monorepo-architecture.md)
- 🚀 Start coding!

**Happy contributing!** 🚀

