# CocoStudio API -- NestJS with Clean Architecture

Backend service for CocoStudio, built with [NestJS 11](https://nestjs.com/) following **Clean Architecture** principles. Exposes a **pure GraphQL API** -- all operations including authentication are GraphQL mutations and queries.

## Key Features

- **Framework**: NestJS 11.1.12
- **Language**: TypeScript 5.8.3
- **API**: Pure GraphQL (Apollo Server 5, Apollo Sandbox)
- **Authentication**: [Better Auth](https://better-auth.com) with email verification (OTP via Resend)
- **Database**: PostgreSQL (Neon) + Prisma 7 via `@cocostudio/database`
- **Rate Limiting**: @nestjs/throttler with GraphQL-aware guard
- **GraphQL Security**: Custom depth-limiting validation rule
- **Validation**: class-validator + class-transformer (ValidationPipe)
- **Logging**: Pino via nestjs-pino (structured JSON logs)
- **Testing**: Vitest 4.0.18 + Supertest

## Architecture Layers

The application enforces strict Clean Architecture separation of concerns:

```
src/
├── controllers/                    # REST (app status endpoint only)
│   └── app.controller.ts
├── core/
│   ├── abstracts/                  # Ports (repository & service interfaces)
│   │   ├── auth-service.abstract.ts
│   │   ├── collection-repository.abstract.ts
│   │   ├── file-repository.abstract.ts
│   │   ├── generic-repository.abstract.ts
│   │   ├── storage-service.abstract.ts
│   │   ├── user-repository.abstract.ts
│   │   └── workflow-repository.abstract.ts
│   ├── entities/                   # Domain entities (pure TypeScript)
│   │   ├── collection.entity.ts
│   │   ├── file.entity.ts
│   │   ├── user.entity.ts
│   │   └── workflow.entity.ts
│   └── errors/                     # Domain error hierarchy
│       └── domain.errors.ts        # DomainError, NotFoundError, ForbiddenError,
│                                   # BadRequestError, ValidationError,
│                                   # AuthenticationError, InternalServerError
├── use-cases/
│   ├── auth/                       # SignUp, SignIn, SignOut (3)
│   ├── collection/                 # Create, Get, GetAll, Update, Delete (5)
│   ├── file/                       # Create, Delete, GetByCollection (3)
│   ├── otp/                        # SendVerificationOtp, VerifyEmail,
│   │                               # RequestPasswordReset, ResetPassword (4)
│   ├── profile/                    # UpdateProfile, ChangePassword,
│   │                               # ListSessions, RevokeSession (4)
│   └── workflow/                   # Create, Get, GetAll, Update, Delete (5)
├── frameworks/
│   ├── auth/                       # Better Auth integration
│   │   ├── auth.module.ts          # Auth module with BetterAuthService
│   │   ├── better-auth.service.ts  # Wraps Better Auth for NestJS DI
│   │   ├── auth.guard.ts           # Session validation guard
│   │   └── current-user.decorator.ts
│   ├── database/                   # Database utilities
│   │   └── query-analyzer.interceptor.ts
│   ├── data-services/prisma/       # Prisma repository implementations
│   │   ├── prisma-collection.repository.ts
│   │   ├── prisma-file.repository.ts
│   │   ├── prisma-user.repository.ts
│   │   ├── prisma-workflow.repository.ts
│   │   ├── prisma-generic-repository.ts
│   │   ├── prisma.service.ts
│   │   ├── prisma-data-services.module.ts
│   │   └── prisma-data-services.service.ts
│   ├── graphql/
│   │   ├── graphql-config.module.ts  # Apollo Server config + depth limiting
│   │   ├── graphql.module.ts         # All resolvers + use cases wiring
│   │   ├── resolvers/               # GraphQL resolvers (thin, delegate to use cases)
│   │   │   ├── auth.resolver.ts     # signUp, signIn, signOut mutations
│   │   │   ├── collection.resolver.ts
│   │   │   ├── file.resolver.ts
│   │   │   ├── otp.resolver.ts
│   │   │   ├── profile.resolver.ts
│   │   │   ├── user.resolver.ts     # me query
│   │   │   └── workflow.resolver.ts
│   │   ├── types/                   # GraphQL input/output types (class-validator)
│   │   ├── guards/
│   │   │   └── gql-throttler.guard.ts  # Rate limiting for GraphQL
│   │   ├── errors/
│   │   │   └── auth.error.ts
│   │   └── validation/
│   │       └── depth-limit.rule.ts  # Custom query depth limiter
│   ├── logger/                      # Pino structured logging
│   │   ├── logger.module.ts
│   │   ├── logger.service.ts
│   │   └── graphql-logging.interceptor.ts
│   └── storage/
│       └── uploadthing-storage.service.ts
├── __tests__/
│   └── architecture.spec.ts        # Architecture constraint tests
├── services/
│   └── data-services/              # Data services module (DI wiring)
└── main.ts                         # NestJS bootstrap
```

## Authentication

Pure GraphQL authentication using **Better Auth** with Prisma Adapter:

- **GraphQL Mutations**: `signUp`, `signIn`, `signOut` (no REST endpoints exposed)
- **Email Verification**: OTP-based via Resend email service
- **OTP Mutations**: `sendVerificationOtp`, `verifyEmail`, `requestPasswordReset`, `resetPassword`
- **Session Management**: Cookie-based sessions validated by `AuthGuard`
- **Protected Resolvers**: Use `@UseGuards(AuthGuard)` decorator
- **CurrentUser**: `@CurrentUser()` decorator extracts authenticated user from context

## Security

- **Rate Limiting**: Global `GqlThrottlerGuard` via `@nestjs/throttler` (100 requests per 60s)
- **GraphQL Depth Limiting**: Custom validation rule rejects queries exceeding max nesting depth
- **Input Validation**: `ValidationPipe` with `class-validator` and `class-transformer` (whitelist mode, transform enabled)
- **Cookie Security**: Secure, HttpOnly cookies for session tokens

## Domain Errors

The `core/errors/` layer defines a typed error hierarchy used across all use cases:

| Error Class | Code | Status |
|---|---|---|
| `NotFoundError` | `NOT_FOUND` | 404 |
| `ForbiddenError` | `FORBIDDEN` | 403 |
| `BadRequestError` | `BAD_REQUEST` | 400 |
| `ValidationError` | `BAD_USER_INPUT` | 400 |
| `AuthenticationError` | `UNAUTHENTICATED` | 401 |
| `InternalServerError` | `INTERNAL_SERVER_ERROR` | 500 |

These are framework-agnostic (pure TypeScript) and mapped to GraphQL errors at the resolver layer.

## Setup

1. **Environment Variables** -- configure `.env` in the monorepo root:

    ```bash
    DATABASE_URL="postgresql://..."
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="http://localhost:3001"
    RESEND_API_KEY="re_xxxxxxxxxxxx"
    RESEND_FROM_EMAIL="noreply@yourdomain.com"
    FRONTEND_URL="http://localhost:3000"
    ```

2. **Database Migration**:

    ```bash
    pnpm prisma:migrate
    ```

3. **Run Development**:

    ```bash
    pnpm api:dev
    ```

4. **GraphQL Sandbox**: Open `http://localhost:3001/graphql` in the browser.

## Testing

```bash
# Unit & Integration Tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E Tests
pnpm test:e2e
```

Test coverage:
- Domain errors (all error types, inheritance, properties)
- Collection use cases (create, get, getAll, update, delete)
- Profile use cases (change password, update profile)
- Prisma generic repository (infrastructure layer)
