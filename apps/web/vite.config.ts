import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@astranox/types': path.resolve(__dirname, '../../packages/types/index.ts'),
      '@astranox/constants': path.resolve(__dirname, '../../packages/constants/index.ts'),
    },
  },
  server: {
    port: 4001,
    strictPort: false, // Automatically try next port if in use
    host: '0.0.0.0', // Expose to local network (force IPv4)
  },
});
