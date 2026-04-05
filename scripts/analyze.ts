/**
 * CocoStudio Static Analysis Script
 *
 * Scans the codebase for structural issues that runtime cannot catch:
 * 1. Use cases without tests
 * 2. Features without shared Zod schemas
 * 3. Files exceeding 300 lines
 * 4. Resolvers with direct prisma/auth calls (bypassing use cases)
 * 5. Orphan files (dead code in apps/api/src)
 *
 * Run: npx tsx scripts/analyze.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const API_SRC = path.join(ROOT, 'apps', 'api', 'src');
const WEB_FEATURES = path.join(ROOT, 'apps', 'web', 'features');
const SHARED_SCHEMAS = path.join(ROOT, 'packages', 'shared', 'src', 'schemas');

const MAX_LINES = 300;

interface Issue {
  category: string;
  message: string;
}

const issues: Issue[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function walkFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, dist, and .next (generated)
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue;
      results.push(...walkFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function relative(filePath: string): string {
  return path.relative(ROOT, filePath);
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

// ---------------------------------------------------------------------------
// 1. Use cases without tests
// ---------------------------------------------------------------------------

function checkUseCaseTests(): void {
  const useCasesDir = path.join(API_SRC, 'use-cases');
  if (!fs.existsSync(useCasesDir)) {
    console.log('  (skipped — use-cases directory not found)');
    return;
  }

  const useCaseFiles = walkFiles(useCasesDir, ['.use-case.ts']).filter(
    (f) => !f.includes('__tests__') && !f.includes('.spec.'),
  );

  const missingTests: string[] = [];

  for (const ucFile of useCaseFiles) {
    const dir = path.dirname(ucFile);
    const baseName = path.basename(ucFile, '.use-case.ts');
    const testDir = path.join(dir, '__tests__');
    const testFile = path.join(testDir, `${baseName}.use-case.spec.ts`);

    if (!fs.existsSync(testFile)) {
      missingTests.push(relative(ucFile));
    }
  }

  if (missingTests.length === 0) {
    console.log(
      `  \u2713 All use cases have tests (${useCaseFiles.length}/${useCaseFiles.length})`,
    );
  } else {
    const tested = useCaseFiles.length - missingTests.length;
    console.log(
      `  \u2717 Missing tests (${tested}/${useCaseFiles.length} covered):`,
    );
    for (const f of missingTests) {
      console.log(`    - ${f}`);
      issues.push({ category: 'missing-test', message: f });
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Features without shared Zod schemas
// ---------------------------------------------------------------------------

function checkFeatureSchemas(): void {
  if (!fs.existsSync(WEB_FEATURES)) {
    console.log('  (skipped — features directory not found)');
    return;
  }

  const featureDirs = fs
    .readdirSync(WEB_FEATURES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (featureDirs.length === 0) {
    console.log('  (skipped — no feature directories found)');
    return;
  }

  // Collect schema file basenames (e.g., collection.schema.ts -> collection)
  const schemaNames = new Set<string>();
  if (fs.existsSync(SHARED_SCHEMAS)) {
    const schemaFiles = fs.readdirSync(SHARED_SCHEMAS);
    for (const sf of schemaFiles) {
      const match = sf.match(/^(.+)\.schema\.ts$/);
      if (match) schemaNames.add(match[1]);
    }
  }

  const missing: string[] = [];
  for (const feature of featureDirs) {
    // Normalize: features dir name (plural) -> schema name (singular)
    // Check both plural and singular forms
    const singular = feature.endsWith('s') ? feature.slice(0, -1) : feature;
    if (!schemaNames.has(feature) && !schemaNames.has(singular)) {
      missing.push(feature);
    }
  }

  if (missing.length === 0) {
    console.log(
      `  \u2713 All features have shared schemas (${featureDirs.length}/${featureDirs.length})`,
    );
  } else {
    console.log(`  \u2717 Features without shared Zod schemas:`);
    for (const f of missing) {
      console.log(`    - apps/web/features/${f}/ (no schema in packages/shared/src/schemas/)`);
      issues.push({
        category: 'missing-schema',
        message: `apps/web/features/${f}/`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Large files (>300 lines)
// ---------------------------------------------------------------------------

function checkLargeFiles(): void {
  const allFiles = [
    ...walkFiles(path.join(ROOT, 'apps'), ['.ts', '.tsx']),
    ...walkFiles(path.join(ROOT, 'packages'), ['.ts', '.tsx']),
  ];

  const largeFiles: Array<{ file: string; lines: number }> = [];

  for (const f of allFiles) {
    const lines = countLines(f);
    if (lines > MAX_LINES) {
      largeFiles.push({ file: relative(f), lines });
    }
  }

  if (largeFiles.length === 0) {
    console.log(`  \u2713 No files exceed ${MAX_LINES} lines`);
  } else {
    console.log(`  \u2717 Large files (>${MAX_LINES} lines):`);
    for (const { file, lines } of largeFiles.sort((a, b) => b.lines - a.lines)) {
      console.log(`    - ${file} (${lines} lines) — SPLIT RECOMMENDED`);
      issues.push({
        category: 'large-file',
        message: `${file} (${lines} lines)`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Resolvers calling prisma/auth directly (bypassing use cases)
// ---------------------------------------------------------------------------

function checkResolverViolations(): void {
  const resolversDir = path.join(
    API_SRC,
    'frameworks',
    'graphql',
    'resolvers',
  );
  if (!fs.existsSync(resolversDir)) {
    console.log('  (skipped — resolvers directory not found)');
    return;
  }

  const resolverFiles = walkFiles(resolversDir, ['.resolver.ts']);
  const violations: Array<{ file: string; line: number; match: string }> = [];

  // Patterns that indicate direct database/auth calls instead of use case delegation
  const directCallPatterns = [
    /prisma\.\w+\.\w+/,         // prisma.user.findMany(), etc.
    /this\.prisma\./,            // injected prisma service
    /auth\.\w+\.\w+\(/,         // auth.api.signUp(), etc. (but not this.xxxUseCase)
    /\.findMany\(/,
    /\.findUnique\(/,
    /\.findFirst\(/,
    /\.create\(/,
    /\.update\(/,
    /\.delete\(/,
    /\.upsert\(/,
  ];

  // Exclude patterns (these are fine in resolvers)
  const excludePatterns = [
    /UseCase/,        // Use case calls are fine
    /\.execute\(/,    // Use case execution is fine
  ];

  for (const resolverFile of resolverFiles) {
    const content = fs.readFileSync(resolverFile, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip imports and comments
      if (line.trimStart().startsWith('import ') || line.trimStart().startsWith('//')) continue;

      for (const pattern of directCallPatterns) {
        if (pattern.test(line)) {
          // Check if line also matches an exclude pattern
          const isExcluded = excludePatterns.some((ep) => ep.test(line));
          if (!isExcluded) {
            violations.push({
              file: relative(resolverFile),
              line: i + 1,
              match: line.trim(),
            });
          }
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log(
      `  \u2713 No direct prisma/auth calls in resolvers (${resolverFiles.length} resolvers checked)`,
    );
  } else {
    console.log(`  \u2717 Direct prisma/auth calls found in resolvers:`);
    for (const v of violations) {
      console.log(`    - ${v.file}:${v.line} → ${v.match}`);
      issues.push({
        category: 'resolver-violation',
        message: `${v.file}:${v.line}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Orphan files (files not imported by any other file in apps/api/src)
// ---------------------------------------------------------------------------

function checkOrphanFiles(): void {
  if (!fs.existsSync(API_SRC)) {
    console.log('  (skipped — apps/api/src not found)');
    return;
  }

  const allTsFiles = walkFiles(API_SRC, ['.ts']).filter(
    (f) => !f.includes('__tests__') && !f.endsWith('.spec.ts') && !f.endsWith('.test.ts'),
  );

  // Build a set of all file contents to search for imports
  const fileContents = new Map<string, string>();
  for (const f of allTsFiles) {
    fileContents.set(f, fs.readFileSync(f, 'utf-8'));
  }

  // Known entry points that are always "imported" (bootstrapped by framework)
  const entryPoints = new Set(['main.ts', 'app.module.ts']);

  const orphans: string[] = [];

  for (const filePath of allTsFiles) {
    const fileName = path.basename(filePath);
    const fileNameNoExt = fileName.replace(/\.ts$/, '');

    // Skip entry points
    if (entryPoints.has(fileName)) continue;

    // Check if this file's module name appears in any other file's imports
    let isImported = false;

    for (const [otherPath, otherContent] of fileContents) {
      if (otherPath === filePath) continue;

      // Check for imports referencing this file (by basename without extension)
      // Matches: from './foo', from '../foo', from '../../foo/bar'
      if (otherContent.includes(`/${fileNameNoExt}'`) || otherContent.includes(`/${fileNameNoExt}"`)) {
        isImported = true;
        break;
      }
    }

    // Also check if the file is an index.ts that re-exports (barrel file in a dir that's imported)
    if (!isImported && fileName === 'index.ts') {
      const dirName = path.basename(path.dirname(filePath));
      for (const [otherPath, otherContent] of fileContents) {
        if (otherPath === filePath) continue;
        if (otherContent.includes(`/${dirName}'`) || otherContent.includes(`/${dirName}"`)) {
          isImported = true;
          break;
        }
      }
    }

    if (!isImported) {
      orphans.push(relative(filePath));
    }
  }

  if (orphans.length === 0) {
    console.log(`  \u2713 No orphan files detected (${allTsFiles.length} files scanned)`);
  } else {
    console.log(`  \u2717 Potentially orphan files (not imported by any other file):`);
    for (const o of orphans) {
      console.log(`    - ${o}`);
      issues.push({ category: 'orphan-file', message: o });
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('=== CocoStudio Code Analysis ===\n');

console.log('[1/5] Use case test coverage:');
checkUseCaseTests();

console.log('\n[2/5] Feature schema coverage:');
checkFeatureSchemas();

console.log('\n[3/5] File size check:');
checkLargeFiles();

console.log('\n[4/5] Resolver architecture compliance:');
checkResolverViolations();

console.log('\n[5/5] Orphan file detection:');
checkOrphanFiles();

console.log(`\n=== Summary: ${issues.length} issue${issues.length === 1 ? '' : 's'} found ===`);

if (issues.length > 0) {
  const grouped = new Map<string, number>();
  for (const issue of issues) {
    grouped.set(issue.category, (grouped.get(issue.category) ?? 0) + 1);
  }
  for (const [category, count] of grouped) {
    console.log(`  ${category}: ${count}`);
  }
}

process.exit(issues.length > 0 ? 1 : 0);
