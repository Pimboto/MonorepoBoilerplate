# CocoStudio Monorepo

Professional monorepo with **Turborepo**, **Biome**, **Vitest** - featuring Next.js 15 and NestJS 11 with clean architecture.

## 📁 Project Structure

```
cocostudio/
├── apps/
│   ├── web/              # Next.js 15 + HeroUI v3 (Frontend)
│   └── api/              # NestJS 11 Clean Architecture (Backend)
├── packages/             # Shared packages (ready for future use)
├── biome.json            # Biome configuration (lint + format)
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # pnpm workspaces
```

## 🚀 Tech Stack

### 🎯 Modern Tooling (2026)
- **Build System:** Turborepo 2.7.6
- **Linting + Formatting:** Biome 2.3.12 (Rust-based, 15-50x faster than ESLint + Prettier)
- **Testing:** Vitest 4.0.18 (10x faster than Jest, Vite-powered)
- **Package Manager:** pnpm 9.15.4

### 📦 Web App (`apps/web`)
- **Framework:** Next.js 15.5.9 (App Router, Turbopack)
- **UI Library:** HeroUI v3 Beta (React Aria + Tailwind CSS v4)
- **React:** React 19.2.3
- **Styling:** Tailwind CSS 4.1.11
- **Language:** TypeScript 5.6.3

### ⚙️ API (`apps/api`)
- **Framework:** NestJS 11.1.12
- **Architecture:** Clean Architecture Pattern
- **Database:** PostgreSQL (Neon) + Prisma 7
- **Authentication:** Better Auth (Secure, Self-hosted)
- **Language:** TypeScript 5.8.3
- **Testing:** Vitest 4.0.18
- **Validation:** class-validator 0.14.3

## 🛠️ Prerequisites

- **Node.js:** >= 18.0.0 (recommended: 22.x)
- **pnpm:** >= 9.0.0

```bash
npm install -g pnpm@latest
```

## 📦 Installation

```bash
pnpm install
```

## ⚙️ Configuration

### API Environment

Create `apps/api/.env` (or use root `.env`):

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3001"
```

### Web Environment (Optional)

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏃 Development

### Run Everything

```bash
pnpm dev
```

Starts all apps concurrently with Turborepo TUI.

### Run Individual Apps

```bash
# Frontend only
pnpm web:dev

# Backend only
pnpm api:dev
```

## 🏗️ Build

```bash
# Build all
pnpm build

# Individual builds
pnpm web:build
pnpm api:build
```

## 🧪 Testing (Vitest)

```bash
# Run all tests
pnpm test

# Watch mode (fast HMR)
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests (API)
cd apps/api && pnpm test:e2e
```

## 🎨 Code Quality (Biome)

```bash
# Lint + format + organize imports (one command!)
pnpm check

# Just lint
pnpm lint

# Just format
pnpm format
```

**Why Biome?**
- ⚡ 15-50x faster than ESLint + Prettier
- 🦀 Written in Rust, single binary
- 🔧 Zero config for most use cases
- 🎯 Auto-fixes, import sorting built-in
- 💾 95% compatible with ESLint/Prettier rules

## 🚀 Production

```bash
# Start all in production
pnpm start

# Individual start
cd apps/web && pnpm start      # Web
cd apps/api && pnpm start:prod # API
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm start` | Start all in production |
| `pnpm check` | Lint + format + organize imports (Biome) |
| `pnpm lint` | Lint code (Biome) |
| `pnpm format` | Format code (Biome) |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:watch` | Watch mode tests |
| `pnpm test:cov` | Coverage reports |
| `pnpm clean` | Clean all artifacts |
| `pnpm web:dev` | Web app only |
| `pnpm api:dev` | API only |

## 🔥 Turborepo Features

- ⚡ **Parallel Execution** - Independent tasks run in parallel
- 💾 **Smart Caching** - Local + remote cache ready
- 🔗 **Task Dependencies** - Auto-ordered execution
- 📦 **Incremental Builds** - Only rebuild what changed
- 🎯 **Task Filtering** - `--filter` for specific apps
- 📊 **TUI Mode** - Beautiful terminal UI

## 📚 Adding Shared Packages

```bash
mkdir -p packages/shared-types
cd packages/shared-types
pnpm init
```

Reference in apps:

```json
{
  "dependencies": {
    "shared-types": "workspace:*"
  }
}
```

## 🔧 VSCode Integration

Recommended extensions (`.vscode/extensions.json`):
- Biome (biomejs.biome)
- Tailwind CSS IntelliSense
- TypeScript Language Features

Auto-configured:
- Format on save with Biome
- TypeScript workspace version

## 📖 Learn More

- [Turborepo](https://turbo.build/repo) - Build system
- [Biome](https://biomejs.dev) - Linter + Formatter
- [Vitest](https://vitest.dev) - Testing framework
- [Next.js 15](https://nextjs.org) - React framework
- [NestJS 11](https://docs.nestjs.com) - Node.js framework
- [HeroUI](https://heroui.com) - UI components
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🐛 Troubleshooting

### Clear dependencies

```bash
pnpm store prune
rm -rf node_modules apps/*/node_modules pnpm-lock.yaml
pnpm install
```

### Clear Turbo cache

```bash
pnpm turbo run build --force
```

### Biome not working?

```bash
# Check config
pnpm biome check --verbose

# Re-format everything
pnpm check
```

## 📄 License

- **Web:** MIT
- **API:** UNLICENSED

## 🚀 What's Modern Here? (2026)

✅ **Single .gitignore** at root (not per-app)
✅ **Biome** instead of ESLint + Prettier (10-50x faster)
✅ **Vitest** instead of Jest (faster, better DX)
✅ **Turborepo 2.x** with TUI mode
✅ **Next.js 15** with Turbopack
✅ **NestJS 11** with latest packages
✅ **pnpm workspaces** for optimal dep management
✅ **TypeScript 5.x** across the board

This is a **2026-ready** monorepo setup. Clean, fast, and production-grade.
