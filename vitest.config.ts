import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    passWithNoTests: false,
    coverage: {
      // Globs for directories that do not exist yet match nothing and add nothing; the
      // 90% thresholds bind to each file as soon as it appears (see docs/P1.1-RUNBOOK.md).
      provider: 'v8',
      include: [
        'scripts/**/*.ts',
        'src/lib/**/*.ts',
        'src/config/**/*.ts',
        'src/data/manifest/**/*.ts',
      ],
      exclude: [],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
