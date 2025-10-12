# Documentation Index

Welcome to the youssefaltai.com monorepo documentation! This directory contains all technical documentation, architectural decisions, research, and deployment guides.

---

## 📚 Quick Navigation

### Getting Started
- 🚀 [Main README](../README.md) - Project overview and quick start
- 📋 [Development Standards](development/standards.md) - Coding standards and best practices

### Architecture & Design
- 🏗️ [Monorepo Architecture](architecture/monorepo-architecture.md) - Turborepo + PNPM design decisions
- 📊 [Project Summary](architecture/project-summary.md) - Complete project overview and current status

### Finance App Documentation
- 📖 [Finance App Overview](finance/README.md) - Complete finance app documentation
- 💡 [Core Concepts](finance/core-concepts.md) - Double-entry bookkeeping explained
- 💱 [Multi-Currency System](finance/multi-currency.md) - Currency conversion and exchange rates
- 🏗️ [Architecture](finance/architecture.md) - Code organization and patterns
- 📋 [API Reference](finance/api-reference.md) - Complete API documentation

### Research Documents
- 📅 [Date & Time Handling](research/date-time-handling.md) - Full timestamp storage with date-fns
- 🍎 [Apple Design System](research/apple-design-system.md) - iOS-inspired design implementation
- 🔄 [State Management](research/state-management.md) - TanStack Query + Zustand architecture

### Deployment Guides
- 🚀 [VPS Deployment](deployment/vps-deployment.md) - Complete VPS deployment guide
- ✅ [VPS Checklist](deployment/vps-checklist.md) - Quick deployment reference
- 🌍 [Environment Variables](deployment/environment-variables.md) - Environment configuration
- 🔄 [CI/CD Setup](deployment/ci-cd-setup.md) - GitLab CI/CD configuration

---

## 📂 Directory Structure

```
docs/
├── README.md                          # This file
├── architecture/                      # System architecture and design
│   ├── monorepo-status.md            # Current state, metrics, health
│   ├── monorepo-architecture.md      # Turborepo structure and decisions
│   └── project-summary.md            # Project status and overview
├── finance/                           # Finance app documentation
│   ├── README.md                     # Finance overview
│   ├── core-concepts.md              # Double-entry bookkeeping
│   ├── multi-currency.md             # Currency handling
│   ├── architecture.md               # Code organization
│   └── api-reference.md              # API endpoints
├── research/                          # Feature research and decisions
│   ├── state-management.md           # TanStack Query + Zustand
│   ├── date-time-handling.md         # Date/time storage and formatting
│   └── apple-design-system.md        # iOS design patterns
├── deployment/                        # Deployment and operations
│   ├── vps-deployment.md             # Full deployment guide
│   ├── vps-checklist.md              # Quick reference checklist
│   ├── environment-variables.md      # Environment configuration
│   └── ci-cd-setup.md                # CI/CD pipeline setup
└── development/                       # Development guides
    ├── local-setup.md                # Local database and Redis setup
    ├── contributing.md               # Contribution workflow
    └── standards.md                   # Coding standards and rules
```

---

## 🎯 Documentation Philosophy

This documentation follows these principles:

1. **Research Before Doing** - Every major decision is documented with research, alternatives, and rationale
2. **Decision Records** - All architectural decisions include why alternatives were rejected
3. **Living Documentation** - Updated as the project evolves
4. **Minimalism** - Only necessary documentation, avoiding redundancy
5. **Practical Examples** - Code examples and real-world usage

---

## 📖 How to Use This Documentation

### For New Contributors
1. Start with [Main README](../README.md) for project overview
2. Review [Development Standards](development/standards.md) for coding guidelines
3. Check [Monorepo Architecture](architecture/monorepo-architecture.md) to understand the structure

### For Implementing Features
1. Check if research exists in `research/` for similar features
2. Follow the research format for new features (see any research doc)
3. Update relevant documentation when making changes

### For Deployment
1. Follow [VPS Deployment Guide](deployment/vps-deployment.md) for first deployment
2. Use [VPS Checklist](deployment/vps-checklist.md) for quick reference
3. Set up [Environment Variables](deployment/environment-variables.md) correctly

---

## 🔍 Finding Information

### By Topic

**Architecture & Decisions:**
- Monorepo structure → [Monorepo Architecture](architecture/monorepo-architecture.md)
- Project overview → [Project Summary](architecture/project-summary.md)

**Finance App:**
- Finance overview → [Finance App](finance/README.md)
- Double-entry system → [Core Concepts](finance/core-concepts.md)
- Currency handling → [Multi-Currency System](finance/multi-currency.md)
- Code patterns → [Architecture](finance/architecture.md)
- API endpoints → [API Reference](finance/api-reference.md)

**Feature Implementation:**
- Date handling → [Date & Time Handling](research/date-time-handling.md)
- UI design → [Apple Design System](research/apple-design-system.md)
- State management → [State Management](research/state-management.md)

**Deployment & Operations:**
- First-time deployment → [VPS Deployment](deployment/vps-deployment.md)
- Quick deploy steps → [VPS Checklist](deployment/vps-checklist.md)
- Environment setup → [Environment Variables](deployment/environment-variables.md)
- CI/CD pipeline → [CI/CD Setup](deployment/ci-cd-setup.md)

**Development:**
- Coding standards → [Development Standards](development/standards.md)
- Workspace rules → `.cursor/rules/` directory

---

## 📝 Documentation Standards

### Research Documents
All research documents follow this format:
1. Problem statement (1 sentence)
2. Candidate approaches (3 max)
3. Chosen approach with justification
4. Key commands, links, and references
5. Implementation steps
6. Risks and mitigation

### Code Examples
- Use TypeScript for all code examples
- Include comments for clarity
- Show both good (✅) and bad (❌) patterns
- Provide real-world usage

### Keeping Documentation Updated
- Update documentation when code changes
- Add new research docs for major features
- Archive outdated documents (don't delete)
- Link related documents together

---

## 🤝 Contributing to Documentation

### Adding New Documentation
1. Choose the appropriate directory:
   - `architecture/` - System design decisions
   - `research/` - Feature research and alternatives
   - `deployment/` - Deployment and operations
   - `development/` - Development guides and standards

2. Follow the existing format in that directory
3. Update this README.md to link to your new document
4. Use clear, concise language
5. Include examples and code snippets

### Improving Existing Documentation
1. Keep the existing structure
2. Add clarifications where needed
3. Update outdated information
4. Fix broken links
5. Add more examples if helpful

---

## 📚 External Resources

### Technologies
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [PNPM Documentation](https://pnpm.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

### Best Practices
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🎯 Quick Links

| Category | Document | Purpose |
|----------|----------|---------|
| 🚀 Getting Started | [Main README](../README.md) | Project overview |
| 📋 Standards | [Development Standards](development/standards.md) | Coding guidelines |
| 🏗️ Architecture | [Monorepo Architecture](architecture/monorepo-architecture.md) | System design |
| 💰 Finance | [Finance App](finance/README.md) | Finance documentation |
| 🚀 Deploy | [VPS Deployment](deployment/vps-deployment.md) | Deployment guide |
| ✅ Quick Deploy | [VPS Checklist](deployment/vps-checklist.md) | Deploy checklist |

---

**Last Updated:** October 2025  
**Maintained By:** Youssef Altai  
**Questions?** Review the relevant document or create an issue.

