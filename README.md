# CocoStudio Monorepo

SaaS platform for AI-powered creative workflows (ComfyUI on RunPod). Built as a professional **Turborepo** monorepo with **Biome**, **Vitest**, Next.js 15, and NestJS 11 following Clean Architecture.

## Project Structure

```
cocostudio/
├── apps/
│   ├── web/              # Next.js 15 + HeroUI v3 (Frontend)
│   └── api/              # NestJS 11 Clean Architecture (Backend)
├── packages/
│   ├── database/         # Shared Prisma 7 client + PostgreSQL (Neon)
│   └── shared/           # Shared Zod schemas, types, utilities
├── .github/workflows/    # CI/CD (GitHub Actions)
├── biome.json            # Biome configuration (lint + format)
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # pnpm workspaces
```

## Tech Stack

### Tooling

- **Build System:** Turborepo 2.7.6
- **Linting + Formatting:** Biome 2.3.12 (Rust-based, 15-50x faster than ESLint + Prettier)
- **Testing:** Vitest 4.0.18 (11 test files, domain + use case + infrastructure + architecture coverage)
- **Package Manager:** pnpm 9.15.4
- **CI/CD:** GitHub Actions (lint, typecheck, test, build)

### Web App (`apps/web`)

- **Framework:** Next.js 15.5.9 (App Router, Turbopack)
- **UI Library:** HeroUI v3 (React Aria + Tailwind CSS v4)
- **React:** React 19
- **Styling:** Tailwind CSS 4.1.11 + Tailwind Variants
- **Workflow Canvas:** @xyflow/react (node-based editor)
- **File Uploads:** UploadThing
- **API Client:** graphql-request (client-side GraphQL)
- **Language:** TypeScript 5.8.3

### API (`apps/api`)

- **Framework:** NestJS 11.1.12
- **Architecture:** Clean Architecture (entities, use cases, ports, frameworks)
- **API:** Pure GraphQL (Apollo Server 5) -- no REST endpoints for auth
- **Database:** PostgreSQL (Neon) + Prisma 7 via `@cocostudio/database`
- **Authentication:** Better Auth 1.4.18 with email verification (OTP via Resend)
- **Rate Limiting:** @nestjs/throttler (global GraphQL guard)
- **GraphQL Security:** Custom depth-limiting validation rule
- **Validation:** class-validator + class-transformer + Zod
- **Logging:** Pino via nestjs-pino (structured logging)
- **Language:** TypeScript 5.8.3
- **Testing:** Vitest 4.0.18

### Shared Packages

- **@cocostudio/database:** Singleton Prisma client, Neon serverless adapter, schema (User, Session, Account, Verification, Collection, File, Workflow)
- **@cocostudio/shared:** Zod schemas for auth, collections, files, OTP, profiles, users, workflows

## Prerequisites

- **Node.js:** >= 18.0.0 (recommended: 22.x)
- **pnpm:** >= 9.0.0

```bash
npm install -g pnpm@latest
```

## Installation

```bash
pnpm install
```

## Configuration

### Environment Variables

Create a root `.env` file (or per-package `.env` files):

```bash
# Database (PostgreSQL via Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3001"

# Email (Resend - for OTP verification)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

## Development

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

## Build

```bash
# Build all
pnpm build

# Individual builds
pnpm web:build
pnpm api:build
```

## Testing (Vitest)

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

Test coverage includes:
- Domain errors (core layer purity)
- Collection use cases (create, read, update, delete)
- Profile use cases (change password, update profile)
- Prisma generic repository (infrastructure layer)

## Code Quality (Biome)

```bash
# Lint + format + organize imports (one command)
pnpm check

# Just lint
pnpm lint

# Just format
pnpm format
```

## Production

```bash
# Build first (required before production start)
pnpm build

# Start all in production
pnpm start

# Individual start
cd apps/web && pnpm start      # Web
cd apps/api && pnpm start:prod # API
```

## Scripts Reference

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
| `pnpm web:build` | Build web app only |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:push` | Push schema changes to DB (no migration) |
| `pnpm db:deploy` | Deploy migrations (production) |
| `pnpm db:reset` | Reset database (destructive) |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm analyze` | Run static analysis |
| `pnpm prepare` | Install Husky git hooks |

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on push/PR to `main`:

1. **Lint & Format** -- Biome check (lint + format + imports)
2. **Type Check** -- TypeScript `--noEmit` for the API
3. **Tests** -- Vitest test suite with coverage artifacts
4. **Build** -- Full Turborepo build (runs after all checks pass)

## Architecture Overview

### Backend (Clean Architecture)

```
apps/api/src/
├── controllers/              # REST controller (app status only)
├── core/
│   ├── abstracts/           # Repository & service interfaces (ports)
│   ├── entities/            # Domain entities (pure TypeScript)
│   └── errors/              # Domain error hierarchy
├── use-cases/               # Application business logic
│   ├── auth/                # SignUp, SignIn, SignOut
│   ├── collection/          # CRUD (5 use cases)
│   ├── file/                # Create, Delete, GetByCollection
│   ├── otp/                 # SendVerification, VerifyEmail, RequestPasswordReset, ResetPassword
│   ├── profile/             # UpdateProfile, ChangePassword, ListSessions, RevokeSession
│   └── workflow/            # CRUD (5 use cases)
├── frameworks/
│   ├── auth/                # Better Auth module, AuthGuard, CurrentUser decorator
│   ├── data-services/       # Prisma repository implementations
│   ├── graphql/             # Apollo Server, resolvers, types, validation
│   ├── logger/              # Pino structured logging
│   └── storage/             # UploadThing storage service
└── main.ts
```

### Frontend (Feature-Based)

```
apps/web/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Auth pages (login, signup, verify-email, forgot-password)
│   ├── (marketing)/         # Landing page
│   ├── api/uploadthing/     # UploadThing file upload route
│   └── app/                 # Main application
│       ├── collections/     # Collections pages
│       ├── workflows/       # Workflow list + editor
│       └── settings/        # User settings
├── features/                # Domain features
│   ├── collections/         # Components, hooks, actions
│   ├── files/               # Upload, file list
│   └── workflows/           # Canvas, node palette, custom nodes
├── components/              # Global UI (navbar, sidebar, premium components)
└── lib/                     # GraphQL client, queries, utilities
```

## Turborepo Features

- **Parallel Execution** -- Independent tasks run in parallel
- **Smart Caching** -- Local + remote cache ready
- **Task Dependencies** -- Auto-ordered execution (`^build`)
- **Incremental Builds** -- Only rebuild what changed
- **Task Filtering** -- `--filter` for specific apps
- **TUI Mode** -- Interactive terminal UI

## VSCode Integration

Recommended extensions:
- Biome (biomejs.biome)
- Tailwind CSS IntelliSense
- TypeScript Language Features

## Troubleshooting

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

### Prisma issues

```bash
# Regenerate client
pnpm db:generate

# Reset database (destructive)
cd packages/database && pnpm prisma:reset
```

## Learn More

- [Turborepo](https://turbo.build/repo) - Build system
- [Biome](https://biomejs.dev) - Linter + Formatter
- [Vitest](https://vitest.dev) - Testing framework
- [Next.js 15](https://nextjs.org) - React framework
- [NestJS 11](https://docs.nestjs.com) - Node.js framework
- [HeroUI](https://heroui.com) - UI components (v3)
- [Better Auth](https://better-auth.com) - Authentication
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## License

- **Web:** MIT
- **API:** UNLICENSED
