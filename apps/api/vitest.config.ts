import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
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
