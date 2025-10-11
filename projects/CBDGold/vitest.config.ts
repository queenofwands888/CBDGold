import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'backend/**/__tests__/**/*.{test,spec}.{js,ts}'
    ],
    environmentMatchGlobs: [
      ['backend/**/__tests__/**', 'node']
    ],
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: false
  }
});
