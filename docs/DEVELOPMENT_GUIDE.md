# CocoStudio — Development Guide

How to add features, fix bugs, and write code that passes all checks.

---

## The Golden Rule

Every feature goes through ALL layers. No shortcuts.

```
@cocostudio/shared (Zod schema)
       ↓
   Prisma Schema (database model)
       ↓
   Core Entity (pure TypeScript)
       ↓
   Repository Port (abstract class)
       ↓
   Prisma Repository (implementation)
       ↓
   Use Case (business logic + Zod validation)
       ↓
   GraphQL Type + Input (class-validator decorators)
       ↓
   GraphQL Resolver (thin — delegates to use case)
       ↓
   GraphQL Query/Mutation (lib/graphql/*.ts)
       ↓
   Frontend Component ("use client" + graphqlClient)
```

---

## Step-by-Step: Adding a New Feature

Example: Adding a "Template" feature where users can save workflow templates.

### Step 1: Zod Schema (`packages/shared`)

```typescript
// packages/shared/src/schemas/template.schema.ts
import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  workflowId: z.string().min(1, 'Workflow ID is required'),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
```

Then export from `packages/shared/src/index.ts`:
```typescript
export * from './schemas/template.schema';
```

Run `pnpm --filter=@cocostudio/shared build` to compile.

### Step 2: Prisma Model (`packages/database`)

```prisma
// packages/database/prisma/schema.prisma
model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  nodes       Json     @default("[]")
  edges       Json     @default("[]")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@map("template")
}
```

Add `templates Template[]` to the User model.

Run `pnpm db:push` to sync with database, then `pnpm db:generate`.

### Step 3: Core Entity (`apps/api/src/core/entities/`)

```typescript
// apps/api/src/core/entities/template.entity.ts
export class TemplateEntity {
  id: string;
  name: string;
  description?: string | null;
  nodes: unknown;
  edges: unknown;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Export from `core/entities/index.ts`.

### Step 4: Repository Port (`apps/api/src/core/abstracts/`)

```typescript
// apps/api/src/core/abstracts/template-repository.abstract.ts
import type { TemplateEntity } from '../entities/template.entity';

export abstract class ITemplateRepository {
  abstract getByUserId(userId: string): Promise<TemplateEntity[]>;
  abstract findById(id: string): Promise<TemplateEntity | null>;
  abstract create(data: Partial<TemplateEntity>): Promise<TemplateEntity>;
  abstract update(id: string, data: Partial<TemplateEntity>): Promise<TemplateEntity>;
  abstract delete(id: string): Promise<TemplateEntity>;
}
```

Export from `core/abstracts/index.ts` and add to `IDataServices`:
```typescript
abstract templates: ITemplateRepository;
```

### Step 5: Prisma Repository (`apps/api/src/frameworks/data-services/prisma/`)

```typescript
// prisma-template.repository.ts
import { prisma } from '@cocostudio/database';
import type { TemplateEntity } from '../../../core/entities/template.entity';
import type { ITemplateRepository } from '../../../core/abstracts/template-repository.abstract';

export class PrismaTemplateRepository implements ITemplateRepository {
  async getByUserId(userId: string): Promise<TemplateEntity[]> {
    return prisma.template.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as unknown as TemplateEntity[];
  }

  async findById(id: string): Promise<TemplateEntity | null> {
    return prisma.template.findUnique({
      where: { id },
    }) as unknown as TemplateEntity | null;
  }

  async create(data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    return prisma.template.create({ data: data as never }) as unknown as TemplateEntity;
  }

  async update(id: string, data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    return prisma.template.update({
      where: { id },
      data: data as never,
    }) as unknown as TemplateEntity;
  }

  async delete(id: string): Promise<TemplateEntity> {
    return prisma.template.delete({ where: { id } }) as unknown as TemplateEntity;
  }
}
```

Initialize in `PrismaDataServices.onApplicationBootstrap()`.

### Step 6: Use Cases (`apps/api/src/use-cases/template/`)

Every use case:
- `@Injectable()`
- Injects `IDataServices`
- Validates with Zod from `@cocostudio/shared`
- Checks ownership (`userId`)
- Throws domain errors (`NotFoundError`, `ForbiddenError`, `ValidationError`)

```typescript
// create-template.use-case.ts
import { createTemplateSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import { ValidationError } from '../../core/errors';

@Injectable()
export class CreateTemplateUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(input: { name: string; description?: string; workflowId: string; userId: string }) {
    const result = createTemplateSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    // Get workflow to copy nodes/edges
    const workflow = await this.dataServices.workflows.findById(input.workflowId);
    if (!workflow) throw new NotFoundError('Workflow not found');
    if (workflow.userId !== input.userId) throw new ForbiddenError('Not your workflow');

    return this.dataServices.templates.create({
      name: input.name,
      description: input.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      userId: input.userId,
    });
  }
}
```

Create: `get-templates.use-case.ts`, `get-template.use-case.ts`, `update-template.use-case.ts`, `delete-template.use-case.ts` following the same pattern.

Create `index.ts` barrel export.

### Step 7: GraphQL Types (`apps/api/src/frameworks/graphql/types/`)

```typescript
// template.type.ts
import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class TemplateType {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => GraphQLJSON) nodes: unknown;
  @Field(() => GraphQLJSON) edges: unknown;
  @Field() userId: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
```

```typescript
// template.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class CreateTemplateInput {
  @Field() @IsNotEmpty() name: string;
  @Field({ nullable: true }) @MaxLength(1000) description?: string;
  @Field() @IsNotEmpty() workflowId: string;
}
```

### Step 8: GraphQL Resolver (`apps/api/src/frameworks/graphql/resolvers/`)

```typescript
// template.resolver.ts
@Resolver(() => TemplateType)
@UseGuards(AuthGuard)
export class TemplateResolver {
  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    // ... other use cases
  ) {}

  @Mutation(() => TemplateType)
  async createTemplate(
    @Args('input') input: CreateTemplateInput,
    @CurrentUser() user: User,
  ): Promise<TemplateType> {
    try {
      return (await this.createTemplateUseCase.execute({
        ...input,
        userId: user.id,
      })) as unknown as TemplateType;
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to create template');
    }
  }
}
```

**Key rules for resolvers:**
- `@UseGuards(AuthGuard)` on class (except OTP)
- `try/catch` with `await` on EVERY method
- `DomainError` → `toGraphQLError()`
- NEVER put business logic here

Wire up in `GraphQLApiModule` (add resolver + use cases to providers).

### Step 9: Frontend GraphQL Queries (`apps/web/lib/graphql/`)

```typescript
// lib/graphql/templates.ts
import { gql } from 'graphql-request';

export const GET_TEMPLATES = gql`
  query GetTemplates { ... }
`;
export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) { ... }
`;
```

**Rules:**
- ALL queries go in `lib/graphql/` — never in `features/`
- No `gql` template literals in components

### Step 10: Frontend Component (`apps/web/`)

```typescript
// app/app/templates/page.tsx
'use client';

import { graphqlClient } from '@/lib/graphql-client';
import { GET_TEMPLATES } from '@/lib/graphql/templates';

export default function TemplatesPage() {
  // Fetch via client-side GraphQL (visible in DevTools)
  // Validate forms with Zod from @cocostudio/shared
  // Use theme tokens for all styling
}
```

**Rules:**
- `"use client"` if it uses hooks, HeroUI, or browser APIs
- `graphqlClient` with `credentials: 'include'`
- Validate forms with Zod from `@cocostudio/shared`
- Theme tokens only (`text-foreground`, `bg-content1`, `border-divider`)
- Works in BOTH light and dark mode

### Step 11: Tests (`apps/api/src/use-cases/template/__tests__/`)

Write tests for each use case:
```typescript
describe('CreateTemplateUseCase', () => {
  it('creates a template from a workflow', async () => { ... });
  it('throws ValidationError on invalid input', async () => { ... });
  it('throws ForbiddenError if workflow belongs to another user', async () => { ... });
});
```

### Step 12: Verify Everything

```bash
pnpm check          # Biome lint (any, console.log = ERROR)
pnpm build          # TypeScript + Next.js + NestJS compile
pnpm test           # 11 test files pass
pnpm analyze        # Static analysis
```

ALL must pass before committing.

---

## Rules That Will Fail Your Code

### Biome (instant — in editor)
- `any` type → ERROR
- `console.log/error/warn` → ERROR
- Unused imports/variables → ERROR
- Missing `import type` → ERROR

### Architecture Tests (CI)
- Use case imports from `frameworks/` → FAIL
- Core imports NestJS/GraphQL → FAIL
- Resolver without `@UseGuards(AuthGuard)` → FAIL
- Resolver without `try/catch` → FAIL
- `new Request()` in resolver → FAIL
- `localStorage` in `features/` or `lib/` → FAIL
- `gql` template in `features/` → FAIL
- Hardcoded `text-white/*` colors → FAIL
- Hardcoded `bg-[#hex]` colors → FAIL

### CI Pipeline (GitHub Actions)
- Lint & Format (Biome)
- Type Check (tsc --noEmit)
- Tests (Vitest)
- Build (Next.js + NestJS)

ALL 4 must pass to merge.

---

## File Naming Conventions

| Type | Pattern | Location |
|------|---------|----------|
| Entity | `name.entity.ts` | `core/entities/` |
| Port | `name-repository.abstract.ts` | `core/abstracts/` |
| Domain Error | `domain.errors.ts` | `core/errors/` |
| Use Case | `verb-name.use-case.ts` | `use-cases/domain/` |
| Test | `verb-name.use-case.spec.ts` | `use-cases/domain/__tests__/` |
| Repository | `prisma-name.repository.ts` | `frameworks/data-services/prisma/` |
| Resolver | `name.resolver.ts` | `frameworks/graphql/resolvers/` |
| GraphQL Type | `name.type.ts` | `frameworks/graphql/types/` |
| GraphQL Input | `name.input.ts` | `frameworks/graphql/types/` |
| Zod Schema | `name.schema.ts` | `packages/shared/src/schemas/` |
| GraphQL Query | `name.ts` | `apps/web/lib/graphql/` |

---

## Quick Reference

```bash
# Development
pnpm dev                    # Start everything
pnpm api:dev                # API only
pnpm web:dev                # Web only

# Quality
pnpm check                  # Lint + format
pnpm test                   # All tests
pnpm build                  # Full build
pnpm analyze                # Static analysis

# Database
pnpm db:push                # Sync schema → DB
pnpm db:generate            # Regenerate Prisma client
pnpm db:studio              # Visual DB explorer

# Before committing
pnpm check && pnpm build && pnpm test
```
