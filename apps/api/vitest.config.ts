import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        // Minimum coverage for core business logic
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },
      include: ['src/use-cases/**', 'src/core/**'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/__tests__/**',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
        'vitest.config.ts',
        'vitest.config.e2e.ts',
      ],
    },
    typecheck: {
      enabled: true,
      checker: 'tsc',
      include: ['**/*.spec.ts'],
    },
    include: ['**/*.spec.ts'],
    exclude: ['node_modules/', 'dist/', '**/*.e2e-spec.ts'],
  },
});
