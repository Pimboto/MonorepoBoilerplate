# @cocostudio/database

Centralized database package for the CocoStudio monorepo.

## Overview

This package provides a shared Prisma client, Better Auth instance, and database configuration used across all services in the monorepo (API, workers, scripts, etc.).

## Usage

### In Apps (e.g., apps/api)

```typescript
import { prisma } from '@cocostudio/database';

// Use Prisma client
const users = await prisma.user.findMany();
const collections = await prisma.collection.findMany({ where: { userId } });
const workflows = await prisma.workflow.findMany({ where: { userId } });
```

### Better Auth Instance

```typescript
import { auth } from '@cocostudio/database';

// Use the pre-configured Better Auth instance
const session = await auth.api.getSession({ headers });
```

## Database Models

The Prisma schema defines the following models:

| Model | Purpose |
|---|---|
| **User** | User accounts (id, name, email, emailVerified, image) |
| **Session** | Active sessions (token, expiresAt, ipAddress, userAgent) |
| **Account** | Auth provider accounts (email/password, OAuth) |
| **Verification** | OTP codes for email verification and password reset |
| **Collection** | User-created asset collections |
| **File** | Uploaded files linked to collections (name, url, key, size, type) |
| **Workflow** | AI workflow definitions (nodes/edges stored as JSON) |

All models use `@id` with `cuid()` defaults (except User/Session/Account which use Better Auth IDs). User-owned models cascade-delete when the parent user is removed.

## Configuration

Database connection is configured via environment variables (root `.env` or `packages/database/.env`):

```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3001"

# Email verification (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
FRONTEND_URL="http://localhost:3000"
```

## Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Open Prisma Studio
pnpm prisma:studio

# Reset database (destructive — drops and recreates)
pnpm prisma:reset

# Deploy migrations (production — no interactive prompts)
pnpm prisma:migrate:prod
```

## Architecture

- **Prisma Schema**: `prisma/schema.prisma` -- Database models (User, Session, Account, Verification, Collection, File, Workflow)
- **Prisma Config**: `prisma.config.ts` -- Prisma 7 configuration (package root)
- **Seed File**: `prisma/seed.ts` -- Sample data
- **Client**: `src/index.ts` -- Singleton Prisma client, Better Auth instance, exports

### Lazy Initialization (Proxy Pattern)

The Prisma client and Neon connection pool use a **Proxy-based lazy initialization** pattern. This ensures that `DATABASE_URL` is read at first access rather than at module import time, which is critical for:

- NestJS dependency injection (env vars may not be available at import time)
- Testing (allows mocking without real database connections)
- Serverless environments (cold start optimization)

```typescript
// The proxy delegates to a lazily-initialized PrismaClient
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const target = getPrismaClient();
    const value = target[prop as keyof PrismaClient];
    return typeof value === 'function' ? (value as Function).bind(target) : value;
  },
});
```

### Better Auth Integration

The package exports a pre-configured Better Auth instance with:

- **Prisma Adapter**: Uses the shared Prisma client for session storage
- **Email/Password Auth**: Enabled with email verification required
- **Email OTP Plugin**: 6-digit codes, 10-minute expiry
- **Resend Integration**: Sends verification and password reset emails
- **Trusted Origins**: Configured for both frontend and API URLs

### Exports

```typescript
// Prisma client (lazy singleton)
export const prisma: PrismaClient;

// Neon connection pool (lazy singleton)
export const pool: Pool;

// Better Auth instance
export const auth: BetterAuth;

// Types
export { PrismaClient };
export type { Prisma };
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

## Benefits

- Single source of truth for database schema
- Shared Prisma client across all services (singleton via Proxy)
- Centralized Better Auth configuration
- Centralized migrations and seeding
- Easy to add workers, background jobs, scripts
- No duplicate Prisma configurations
