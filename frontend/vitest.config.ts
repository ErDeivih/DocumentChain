import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineVitestConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['node_modules', 'e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
