import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');

/**
 * Recursively finds all .ts files in a directory.
 * Skips __tests__ directories and .spec.ts / .e2e-spec.ts files.
 */
function getFiles(dir: string, ext = '.ts'): string[] {
  const results: string[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath, { throwIfNoEntry: false });
    if (!stat) continue;

    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules' || entry === 'dist') continue;
      results.push(...getFiles(fullPath, ext));
    } else if (
      entry.endsWith(ext) &&
      !entry.endsWith('.spec.ts') &&
      !entry.endsWith('.e2e-spec.ts')
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Returns the relative path from SRC for readable error messages.
 */
function rel(filePath: string): string {
  return filePath.replace(SRC + '/', '').replace(SRC + '\\', '');
}

// ---------------------------------------------------------------------------
// Clean Architecture Enforcement Tests
// ---------------------------------------------------------------------------

describe('Clean Architecture Rules', () => {
  // =========================================================================
  // RULE 1: Use Cases must NOT import from the frameworks layer
  // =========================================================================
  describe('Use Cases must NOT import from frameworks layer', () => {
    const useCaseFiles = getFiles(join(SRC, 'use-cases'));

    it('should not import from src/frameworks/', () => {
      for (const file of useCaseFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from frameworks/ -- use cases must depend on abstractions (ports), not infrastructure`,
        ).not.toMatch(/from\s+['"].*frameworks/);
      }
    });

    it('should not import @cocostudio/database directly', () => {
      for (const file of useCaseFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @cocostudio/database -- use cases must access data through repository abstractions, not Prisma directly`,
        ).not.toMatch(/from\s+['"]@cocostudio\/database['"]/);
      }
    });

    it('should not import NestJS modules beyond @nestjs/common (Injectable)', () => {
      for (const file of useCaseFiles) {
        const content = readFileSync(file, 'utf-8');
        // Injectable from @nestjs/common is allowed for DI wiring
        // But graphql, platform-express, apollo, etc. are NOT allowed
        expect(
          content,
          `${rel(file)} imports @nestjs/graphql -- use cases must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/graphql/);
        expect(
          content,
          `${rel(file)} imports @nestjs/platform-express -- use cases must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/platform-express/);
        expect(
          content,
          `${rel(file)} imports @nestjs/apollo -- use cases must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/apollo/);
        expect(
          content,
          `${rel(file)} imports @nestjs/testing -- use cases should not depend on test utilities`,
        ).not.toMatch(/from\s+['"]@nestjs\/testing/);
      }
    });
  });

  // =========================================================================
  // RULE 1b: Use cases that validate input must use @cocostudio/shared schemas
  // =========================================================================
  describe('Use cases must validate with @cocostudio/shared', () => {
    it('every use case that has an execute() with input should import from @cocostudio/shared', () => {
      const useCaseFiles = getFiles(join(SRC, 'use-cases'));
      for (const file of useCaseFiles) {
        if (file.endsWith('index.ts')) continue; // skip barrel exports
        const content = readFileSync(file, 'utf-8');
        // If the execute method takes more than just simple string params, it should validate
        // Check: if file imports from core/errors (meaning it handles validation),
        // it should also import from @cocostudio/shared
        if (content.includes('ValidationError') || content.includes('safeParse')) {
          expect(
            content,
            `${rel(file)} handles validation but does not import schemas from @cocostudio/shared`,
          ).toMatch(/from\s+['"]@cocostudio\/shared['"]/);
        }
      }
    });
  });

  // =========================================================================
  // RULE 2: Core layer (entities, errors, abstracts) must be framework-free
  // =========================================================================
  describe('Core layer must be framework-free', () => {
    it('entities should not import NestJS', () => {
      const entityFiles = getFiles(join(SRC, 'core', 'entities'));
      for (const file of entityFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @nestjs -- entities must be pure TypeScript classes with zero framework dependencies`,
        ).not.toMatch(/from\s+['"]@nestjs/);
      }
    });

    it('entities should not import Prisma or database packages', () => {
      const entityFiles = getFiles(join(SRC, 'core', 'entities'));
      for (const file of entityFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @cocostudio/database -- entities must not depend on the database layer`,
        ).not.toMatch(/from\s+['"]@cocostudio\/database['"]/);
        expect(
          content,
          `${rel(file)} imports @prisma/client -- entities must not depend on Prisma`,
        ).not.toMatch(/from\s+['"]@prisma\/client/);
      }
    });

    it('domain errors should not import NestJS or GraphQL', () => {
      const errorFiles = getFiles(join(SRC, 'core', 'errors'));
      for (const file of errorFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @nestjs -- domain errors must be pure TypeScript, no framework coupling`,
        ).not.toMatch(/from\s+['"]@nestjs/);
        expect(
          content,
          `${rel(file)} imports graphql -- domain errors must not depend on GraphQL; use the frameworks/graphql/errors layer for GraphQL-specific errors`,
        ).not.toMatch(/from\s+['"]graphql['"]/);
      }
    });

    it('abstracts/ports should not import infrastructure-level NestJS modules', () => {
      const abstractFiles = getFiles(join(SRC, 'core', 'abstracts'));
      for (const file of abstractFiles) {
        const content = readFileSync(file, 'utf-8');
        // Abstracts may need @nestjs/common for abstract class DI patterns,
        // but must NOT import controllers, graphql, platform-express, etc.
        expect(
          content,
          `${rel(file)} imports @nestjs/graphql -- abstracts must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/graphql/);
        expect(
          content,
          `${rel(file)} imports @nestjs/platform-express -- abstracts must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/platform-express/);
        expect(
          content,
          `${rel(file)} imports @nestjs/apollo -- abstracts must be framework-agnostic`,
        ).not.toMatch(/from\s+['"]@nestjs\/apollo/);
      }
    });

    it('abstracts/ports should not import from frameworks layer', () => {
      const abstractFiles = getFiles(join(SRC, 'core', 'abstracts'));
      for (const file of abstractFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from frameworks/ -- abstracts must not depend on infrastructure implementations`,
        ).not.toMatch(/from\s+['"].*frameworks/);
      }
    });
  });

  // =========================================================================
  // RULE 3: Resolvers must be thin -- delegate to use cases, no direct DB
  // =========================================================================
  describe('Resolvers must NOT contain business logic', () => {
    const resolverFiles = getFiles(join(SRC, 'frameworks', 'graphql', 'resolvers'));

    it('resolvers should not import prisma value directly', () => {
      for (const file of resolverFiles) {
        const content = readFileSync(file, 'utf-8');
        // import type { ... } from '@cocostudio/database' is OK
        // import { prisma } from '@cocostudio/database' is NOT OK
        const importLines = content
          .split('\n')
          .filter(
            line =>
              line.match(/^import\s+\{/) && line.match(/from\s+['"]@cocostudio\/database['"]/),
          );
        for (const line of importLines) {
          // If it's not an `import type`, then check for prisma/auth value imports
          if (!line.match(/^import\s+type\s/)) {
            expect(
              line,
              `${rel(file)} imports prisma as a value from @cocostudio/database -- resolvers must use use cases, not Prisma directly`,
            ).not.toMatch(/\bprisma\b/);
            expect(
              line,
              `${rel(file)} imports auth as a value from @cocostudio/database -- resolvers must use use cases, not auth directly`,
            ).not.toMatch(/\bauth\b/);
          }
        }
      }
    });

    it('resolvers should not import from @prisma/client directly', () => {
      for (const file of resolverFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @prisma/client -- resolvers must delegate to use cases, not access Prisma directly`,
        ).not.toMatch(/from\s+['"]@prisma\/client/);
      }
    });
  });

  // =========================================================================
  // RULE 3b: Resolvers must be protected by AuthGuard
  // =========================================================================
  describe('Resolvers must be protected', () => {
    it('every resolver (except OTP) should have @UseGuards(AuthGuard)', () => {
      const resolverFiles = getFiles(join(SRC, 'frameworks', 'graphql', 'resolvers'));
      for (const file of resolverFiles) {
        const content = readFileSync(file, 'utf-8');
        const className = file.split('/').pop()?.replace('.ts', '') || '';
        // OTP resolver is intentionally public (pre-auth operations)
        if (className.includes('otp')) continue;
        // Every other resolver must have AuthGuard
        expect(
          content,
          `${rel(file)} is missing @UseGuards(AuthGuard) -- all resolvers (except OTP) must be protected`,
        ).toMatch(/@UseGuards\(AuthGuard\)/);
      }
    });
  });

  // =========================================================================
  // RULE 3c: Resolver methods must have try/catch error handling
  // =========================================================================
  describe('Resolver methods must handle errors', () => {
    it('every resolver mutation/query method should have try/catch', () => {
      const resolverFiles = getFiles(join(SRC, 'frameworks', 'graphql', 'resolvers'));
      for (const file of resolverFiles) {
        const content = readFileSync(file, 'utf-8');
        // Count methods with @Query or @Mutation decorators
        const methodDecorators = content.match(/@(Query|Mutation)\(/g) || [];
        // Count try blocks
        const tryBlocks = content.match(/try\s*\{/g) || [];
        // Every decorated method should have a try block
        if (methodDecorators.length > 0) {
          expect(
            tryBlocks.length,
            `${rel(file)} has ${methodDecorators.length} @Query/@Mutation methods but only ${tryBlocks.length} try/catch blocks -- every resolver method must handle errors`,
          ).toBeGreaterThanOrEqual(methodDecorators.length);
        }
      }
    });
  });

  // =========================================================================
  // RULE 3d: Resolvers must not create Request objects (use IAuthService)
  // =========================================================================
  describe('Resolvers must not create Request objects', () => {
    it('resolvers should not create Request objects (use IAuthService instead)', () => {
      const resolverFiles = getFiles(join(SRC, 'frameworks', 'graphql', 'resolvers'));
      for (const file of resolverFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} creates new Request() -- resolvers must use IAuthService abstraction instead of raw Request objects`,
        ).not.toMatch(/new\s+Request\s*\(/);
      }
    });
  });

  // =========================================================================
  // RULE 4: Controllers must be thin -- delegate to use cases
  // =========================================================================
  describe('Controllers must NOT contain business logic', () => {
    const controllerFiles = getFiles(join(SRC, 'controllers'));

    it('controllers should not import from @cocostudio/database directly', () => {
      for (const file of controllerFiles) {
        const content = readFileSync(file, 'utf-8');
        // import type is OK, value imports are not
        const valueImports = content
          .split('\n')
          .filter(
            line =>
              line.match(/^import\s+\{/) &&
              line.match(/from\s+['"]@cocostudio\/database['"]/) &&
              !line.match(/^import\s+type\s/),
          );
        for (const line of valueImports) {
          expect(
            line,
            `${rel(file)} imports values from @cocostudio/database -- controllers must delegate to use cases`,
          ).not.toMatch(/\bprisma\b/);
        }
      }
    });

    it('controllers should not import from @prisma/client directly', () => {
      for (const file of controllerFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @prisma/client -- controllers must delegate to use cases, not access Prisma directly`,
        ).not.toMatch(/from\s+['"]@prisma\/client/);
      }
    });
  });

  // =========================================================================
  // RULE 5: No console.log/console.error in production code
  // =========================================================================
  describe('No console.log in production code', () => {
    it('should use LoggerService instead of console.log', () => {
      const allFiles = getFiles(SRC);
      const srcFiles = allFiles.filter(f => !f.includes('__tests__') && !f.includes('.spec.'));
      for (const file of srcFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} uses console.log() -- use LoggerService (Pino) instead for structured logging`,
        ).not.toMatch(/console\.log\(/);
      }
    });

    it('should use LoggerService instead of console.error', () => {
      const allFiles = getFiles(SRC);
      const srcFiles = allFiles.filter(f => !f.includes('__tests__') && !f.includes('.spec.'));
      for (const file of srcFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} uses console.error() -- use LoggerService (Pino) instead for structured logging`,
        ).not.toMatch(/console\.error\(/);
      }
    });

    it('should use LoggerService instead of console.warn', () => {
      const allFiles = getFiles(SRC);
      const srcFiles = allFiles.filter(f => !f.includes('__tests__') && !f.includes('.spec.'));
      for (const file of srcFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} uses console.warn() -- use LoggerService (Pino) instead for structured logging`,
        ).not.toMatch(/console\.warn\(/);
      }
    });
  });

  // =========================================================================
  // RULE 6: No `any` type in production code (except biome-ignore lines)
  // =========================================================================
  describe('No `any` type in production code', () => {
    it('should not use `: any` type annotations outside biome-ignore suppressions', () => {
      const allFiles = getFiles(SRC);
      const srcFiles = allFiles.filter(f => !f.includes('__tests__') && !f.includes('.spec.'));
      const violations: string[] = [];

      for (const file of srcFiles) {
        const lines = readFileSync(file, 'utf-8').split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip biome-ignore lines and the line immediately after them
          if (line.includes('biome-ignore')) continue;
          if (i > 0 && lines[i - 1].includes('biome-ignore')) continue;
          // Skip comment-only lines
          if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;

          // Match `: any` or `: any[]` or `<any>` type annotations
          // But not strings containing 'any' (e.g., "'any string'")
          if (line.match(/:\s*any\b/) && !line.match(/['"].*any.*['"]/)) {
            violations.push(`  ${rel(file)}:${i + 1} -> ${line.trim()}`);
          }
        }
      }

      expect(
        violations,
        `Found ${violations.length} unexcused \`: any\` type annotation(s). Use proper types or add a biome-ignore comment with justification:\n${violations.join('\n')}`,
      ).toHaveLength(0);
    });
  });

  // =========================================================================
  // RULE 7: Framework independence -- core must not know about HTTP/GraphQL
  // =========================================================================
  describe('Core layer must not depend on transport concerns', () => {
    it('entities should not import express types', () => {
      const entityFiles = getFiles(join(SRC, 'core', 'entities'));
      for (const file of entityFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports express -- entities must be transport-agnostic`,
        ).not.toMatch(/from\s+['"]express['"]/);
      }
    });

    it('abstracts should not import express types', () => {
      const abstractFiles = getFiles(join(SRC, 'core', 'abstracts'));
      for (const file of abstractFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports express -- abstracts must be transport-agnostic`,
        ).not.toMatch(/from\s+['"]express['"]/);
      }
    });
  });

  // =========================================================================
  // RULE 8: No circular dependency between layers
  // =========================================================================
  describe('No reverse dependency from core to outer layers', () => {
    it('core should not import from use-cases', () => {
      const coreFiles = getFiles(join(SRC, 'core'));
      for (const file of coreFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from use-cases/ -- core must never depend on use cases (dependency rule violation)`,
        ).not.toMatch(/from\s+['"].*use-cases/);
      }
    });

    it('core should not import from controllers', () => {
      const coreFiles = getFiles(join(SRC, 'core'));
      for (const file of coreFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from controllers/ -- core must never depend on controllers (dependency rule violation)`,
        ).not.toMatch(/from\s+['"].*controllers/);
      }
    });

    it('use-cases should not import from controllers', () => {
      const useCaseFiles = getFiles(join(SRC, 'use-cases'));
      for (const file of useCaseFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from controllers/ -- use cases must not depend on controllers`,
        ).not.toMatch(/from\s+['"].*controllers/);
      }
    });

    it('use-cases should not import from resolvers', () => {
      const useCaseFiles = getFiles(join(SRC, 'use-cases'));
      for (const file of useCaseFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports from resolvers/ -- use cases must not depend on GraphQL resolvers`,
        ).not.toMatch(/from\s+['"].*resolvers/);
      }
    });
  });

  // =========================================================================
  // RULE 9: File organization -- correct placement
  // =========================================================================
  describe('File organization', () => {
    it('no .resolver.ts files outside frameworks/graphql/resolvers/', () => {
      const allFiles = getFiles(SRC);
      const misplaced = allFiles.filter(
        f => f.endsWith('.resolver.ts') && !f.includes('frameworks/graphql/resolvers'),
      );
      expect(
        misplaced.map(rel),
        `Found resolver file(s) outside frameworks/graphql/resolvers/:\n${misplaced.map(rel).join('\n')}`,
      ).toHaveLength(0);
    });

    it('no .controller.ts files outside controllers/', () => {
      const allFiles = getFiles(SRC);
      const misplaced = allFiles.filter(
        f => f.endsWith('.controller.ts') && !f.includes('controllers/'),
      );
      expect(
        misplaced.map(rel),
        `Found controller file(s) outside controllers/:\n${misplaced.map(rel).join('\n')}`,
      ).toHaveLength(0);
    });

    it('no .entity.ts files outside core/entities/', () => {
      const allFiles = getFiles(SRC);
      const misplaced = allFiles.filter(
        f => f.endsWith('.entity.ts') && !f.includes('core/entities'),
      );
      expect(
        misplaced.map(rel),
        `Found entity file(s) outside core/entities/:\n${misplaced.map(rel).join('\n')}`,
      ).toHaveLength(0);
    });

    it('no .use-case.ts files outside use-cases/', () => {
      const allFiles = getFiles(SRC);
      const misplaced = allFiles.filter(
        f => f.endsWith('.use-case.ts') && !f.includes('use-cases/'),
      );
      expect(
        misplaced.map(rel),
        `Found use-case file(s) outside use-cases/:\n${misplaced.map(rel).join('\n')}`,
      ).toHaveLength(0);
    });
  });
});
