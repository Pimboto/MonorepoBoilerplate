# NestJS API with Clean Architecture

This project is a robust, scalable backend service built with [NestJS](https://nestjs.com/) following **Clean Architecture** principles.

## 🚀 Key Features

*   **Framework**: NestJS 11
*   **Language**: TypeScript 5.x
*   **Authentication**: [Better Auth](https://better-auth.com) (Secure, self-hosted auth)
*   **Database**: PostgreSQL (via Neon) + Prisma 7
*   **API**: Hybrid approach:
    *   REST for Authentication (`/api/auth/*`)
    *   GraphQL for Data/Business Logic
*   **Testing**: Vitest + Supertest

## 🏗️ Architecture Layers

The application is structured to enforce separation of concerns:

1.  **Frameworks & Drivers**: External details (Database, Web Framework, Third-party services).
    *   `src/frameworks`
2.  **Interface Adapters**: Controllers, Resolvers, Presenters.
    *   `src/controllers` (App status)
    *   `src/frameworks/graphql/resolvers` (GraphQL Resolvers)
3.  **Application Business Rules**: Use Cases.
    *   `src/use-cases`
4.  **Enterprise Business Rules**: Entities.
    *   `src/core/entities`

## 🔒 Authentication

We use **Better Auth** with Prisma Adapter.

*   **Endpoints**: Automatically generated at `/api/auth/*`
*   **Methods**: Email/Password (Sign Up, Sign In), and extensible for OAuth.
*   **Integration**:
    *   `AuthModule` in `src/frameworks/auth` wraps Better Auth.
    *   GraphQL Resolvers should be protected using Guards (TODO).

## 🛠️ Setup

1.  **Environment Variables**:
    Ensure `.env` in the monorepo root is configured:
    ```bash
    DATABASE_URL="postgresql://..."
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="http://localhost:3001"
    ```

2.  **Database Migration**:
    ```bash
    pnpm prisma:migrate
    ```

3.  **Run Development**:
    ```bash
    pnpm api:dev
    ```

## 🧪 Testing

```bash
# Unit & Integration Tests
pnpm test

# E2E Tests
pnpm test:e2e
```
