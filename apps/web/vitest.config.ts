import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/setupTests.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@astranox/types': path.resolve(__dirname, '../../packages/types/index.ts'),
    },
  },
});
