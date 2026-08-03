import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/test/**/*.integration.test.ts'], setupFiles: ['src/test/env.ts'], testTimeout: 30000 },
});
