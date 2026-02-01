# @cocostudio/database

Centralized database package for the CocoStudio monorepo.

## Overview

This package provides a shared Prisma client and database configuration that can be used across all services in the monorepo (API, workers, scripts, etc.).

## Usage

### In Apps (e.g., apps/api)

```typescript
import { prisma } from '@cocostudio/database';

// Use Prisma client
const books = await prisma.book.findMany();
```

### In Workers or Scripts

```typescript
import { prisma } from '@cocostudio/database';

// Same Prisma client, same database
const authors = await prisma.author.findMany();
```

## Configuration

Database connection is configured in `packages/database/.env`:

```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
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
```

## Architecture

- **Prisma Schema**: `prisma/schema.prisma` - Database models (Author, Book, Genre)
- **Prisma Config**: `prisma/prisma.config.ts` - Prisma 7 configuration
- **Seed File**: `prisma/seed.ts` - Sample data
- **Client**: `src/client.ts` - Singleton Prisma client
- **Environment**: `.env` - Database connection strings

## Benefits

- ✅ Single source of truth for database schema
- ✅ Shared Prisma client across all services
- ✅ Centralized migrations and seeding
- ✅ Easy to add workers, background jobs, scripts
- ✅ No duplicate Prisma configurations
