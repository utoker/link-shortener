import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // other sessions' git worktrees live in .claude/worktrees/
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
  define: {
    'process.env.UPSTASH_REDIS_REST_URL': '"https://mock-redis-url.upstash.io"',
    'process.env.UPSTASH_REDIS_REST_TOKEN': '"mock-token"',
  },
});