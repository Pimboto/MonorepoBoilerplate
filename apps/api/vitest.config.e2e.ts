import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.e2e-spec.ts'],
    exclude: ['node_modules/', 'dist/', '**/*.spec.ts'],
  },
});
