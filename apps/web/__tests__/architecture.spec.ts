import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

/**
 * Recursively finds all .ts and .tsx files in a directory.
 * Skips __tests__, node_modules, .next, .turbo directories and .spec files.
 */
function getFiles(dir: string, extensions = ['.ts', '.tsx']): string[] {
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
      if (['__tests__', 'node_modules', '.next', '.turbo', 'dist'].includes(entry)) continue;
      results.push(...getFiles(fullPath, extensions));
    } else if (
      extensions.some(ext => entry.endsWith(ext)) &&
      !entry.endsWith('.spec.ts') &&
      !entry.endsWith('.spec.tsx')
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Returns the relative path from ROOT for readable error messages.
 */
function rel(filePath: string): string {
  return filePath.replace(ROOT + '/', '').replace(ROOT + '\\', '');
}

// ---------------------------------------------------------------------------
// Frontend Architecture Enforcement Tests
// ---------------------------------------------------------------------------

describe('Frontend Architecture Rules', () => {
  // =========================================================================
  // RULE 1: No localStorage in features/ or lib/ (use GraphQL/server state)
  // =========================================================================
  describe('No localStorage for data persistence', () => {
    it('features/ should not use localStorage (use GraphQL for data persistence)', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of featureFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} uses localStorage -- features should persist data via GraphQL API, not localStorage`,
        ).not.toMatch(/localStorage/);
      }
    });

    it('lib/ should not use localStorage (use GraphQL for data persistence)', () => {
      const libFiles = getFiles(join(ROOT, 'lib'));
      for (const file of libFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} uses localStorage -- lib utilities should not use browser storage for data persistence`,
        ).not.toMatch(/localStorage/);
      }
    });
  });

  // =========================================================================
  // RULE 2: GraphQL queries must be centralized in lib/graphql/
  // =========================================================================
  describe('GraphQL queries must be centralized', () => {
    it('features/ should not contain gql`` template literals (use lib/graphql/ instead)', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of featureFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} contains gql\`\` -- GraphQL queries must be defined in lib/graphql/, not duplicated in features/`,
        ).not.toMatch(/gql`/);
      }
    });

    it('components/ should not contain gql`` template literals (use lib/graphql/ instead)', () => {
      const componentFiles = getFiles(join(ROOT, 'components'));
      for (const file of componentFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} contains gql\`\` -- GraphQL queries must be defined in lib/graphql/, not in components/`,
        ).not.toMatch(/gql`/);
      }
    });

    it('app/ should not contain gql`` template literals (use lib/graphql/ instead)', () => {
      const appFiles = getFiles(join(ROOT, 'app'));
      for (const file of appFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} contains gql\`\` -- GraphQL queries must be defined in lib/graphql/, not in route handlers`,
        ).not.toMatch(/gql`/);
      }
    });
  });

  // =========================================================================
  // RULE 3: No NestJS imports in frontend code
  // =========================================================================
  describe('No backend framework imports', () => {
    it('should not import @nestjs anywhere in the web app', () => {
      const allFiles = getFiles(ROOT);
      for (const file of allFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @nestjs -- the web app must not depend on NestJS (backend framework)`,
        ).not.toMatch(/from\s+['"]@nestjs/);
      }
    });

    it('should not import prisma directly (use GraphQL API instead)', () => {
      const allFiles = getFiles(ROOT);
      for (const file of allFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports @prisma/client -- the web app must access data via GraphQL API, not Prisma directly`,
        ).not.toMatch(/from\s+['"]@prisma\/client/);
        expect(
          content,
          `${rel(file)} imports @cocostudio/database -- the web app must access data via GraphQL API, not the database package`,
        ).not.toMatch(/from\s+['"]@cocostudio\/database['"]/);
      }
    });
  });

  // =========================================================================
  // RULE 4: No console.log in production frontend code
  // =========================================================================
  describe('No console.log in production code', () => {
    it('should not have console.log in features/, lib/, or components/', () => {
      const dirs = ['features', 'lib', 'components'];
      for (const dir of dirs) {
        const files = getFiles(join(ROOT, dir));
        for (const file of files) {
          const content = readFileSync(file, 'utf-8');
          expect(
            content,
            `${rel(file)} uses console.log() -- remove debug logging from production code`,
          ).not.toMatch(/console\.log\(/);
        }
      }
    });
  });

  // =========================================================================
  // RULE 5: No CSS modules or styled-components (Tailwind only)
  // =========================================================================
  describe('Tailwind CSS only (no CSS modules or styled-components)', () => {
    it('should not import CSS modules in components/', () => {
      const componentFiles = getFiles(join(ROOT, 'components'));
      for (const file of componentFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports .module.css -- use Tailwind CSS classes instead of CSS modules`,
        ).not.toMatch(/from\s+['"].*\.module\.css['"]/);
      }
    });

    it('should not import CSS modules in features/', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of featureFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports .module.css -- use Tailwind CSS classes instead of CSS modules`,
        ).not.toMatch(/from\s+['"].*\.module\.css['"]/);
      }
    });

    it('should not use styled-components', () => {
      const allFiles = getFiles(ROOT);
      for (const file of allFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(
          content,
          `${rel(file)} imports styled-components -- use Tailwind CSS and HeroUI instead`,
        ).not.toMatch(/from\s+['"]styled-components['"]/);
      }
    });
  });

  // =========================================================================
  // RULE 6: Server actions must not import GraphQL queries/mutations
  // =========================================================================
  describe('Server actions must not import from lib/graphql/', () => {
    it('server actions should not import GraphQL queries/mutations', () => {
      // Find all files with 'use server' directive
      const appFiles = getFiles(join(ROOT, 'app'));
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of [...appFiles, ...featureFiles]) {
        const content = readFileSync(file, 'utf-8');
        if (content.includes("'use server'") || content.includes('"use server"')) {
          // Server actions should NOT import from lib/graphql/
          expect(
            content,
            `${rel(file)} is a server action that imports from @/lib/graphql/ -- server actions must define their own queries inline or use a dedicated server-side data layer`,
          ).not.toMatch(/from\s+['"]@\/lib\/graphql\//);
          expect(
            content,
            `${rel(file)} is a server action that imports from graphql/collections -- server actions must define their own queries inline`,
          ).not.toMatch(/from\s+['"].*\/graphql\/collections['"]/);
          expect(
            content,
            `${rel(file)} is a server action that imports from graphql/workflows -- server actions must define their own queries inline`,
          ).not.toMatch(/from\s+['"].*\/graphql\/workflows['"]/);
          expect(
            content,
            `${rel(file)} is a server action that imports from graphql/files -- server actions must define their own queries inline`,
          ).not.toMatch(/from\s+['"].*\/graphql\/files['"]/);
        }
      }
    });
  });

  // =========================================================================
  // RULE 7: No hardcoded dark-mode-only colors in features/components
  // =========================================================================
  describe('No hardcoded dark-mode-only colors', () => {
    it('should not use hardcoded white/opacity colors (use theme tokens)', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      const componentFiles = getFiles(join(ROOT, 'components'), ['.tsx']);
      for (const file of [...featureFiles, ...componentFiles]) {
        const content = readFileSync(file, 'utf-8');
        // Check for patterns like text-white/50, bg-white/[0.06], border-white/10
        // These only work in dark mode.
        // Allow dark: prefixed variants (e.g. dark:border-white/10) since those are theme-aware.
        const allMatches = content.match(/(?:text|bg|border)-white\/[[\d]/g) || [];
        const darkPrefixed = content.match(/dark:(?:text|bg|border)-white\/[[\d]/g) || [];
        const violationCount = allMatches.length - darkPrefixed.length;
        if (violationCount > 0) {
          expect(
            `${rel(file)} has ${violationCount} hardcoded white/opacity classes (without dark: prefix)`,
          ).toBe('');
        }
      }
    });

    it('should not use hardcoded hex background colors', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of featureFiles) {
        const content = readFileSync(file, 'utf-8');
        // bg-[#xxxxxx] is almost always wrong -- should use theme tokens
        const hexBgMatches = content.match(/bg-\[#[0-9a-fA-F]+\]/g) || [];
        if (hexBgMatches.length > 0) {
          expect(`${rel(file)} has hardcoded hex backgrounds: ${hexBgMatches.join(', ')}`).toBe('');
        }
      }
    });
  });

  // =========================================================================
  // RULE 8: No inline style objects (use Tailwind utilities)
  // =========================================================================
  describe('No inline style props (prefer Tailwind)', () => {
    it('features/ should not use style={{ }} props', () => {
      const featureFiles = getFiles(join(ROOT, 'features'));
      for (const file of featureFiles) {
        const content = readFileSync(file, 'utf-8');
        // Match style={{ ... }} but allow style={someVariable} (dynamic styles from libs)
        expect(
          content,
          `${rel(file)} uses inline style={{}} -- use Tailwind CSS utility classes instead`,
        ).not.toMatch(/style=\{\{/);
      }
    });
  });
});
