import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    testTimeout: 15000,
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    globalSetup: ['test/e2e/global-setup.ts'],
    alias: {
      'src': path.resolve(__dirname, 'src'),
    },
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),
    },
  },
});