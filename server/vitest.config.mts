import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Integration tests share one real Postgres connection pool and each
    // test truncates tables itself — running them in parallel worker
    // threads would race on that shared state, so keep this to one thread.
    pool: 'threads',
    singleThread: true,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
