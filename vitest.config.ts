import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // use Vite native tsconfig paths support
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
})
