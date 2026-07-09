/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/retro_site/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
