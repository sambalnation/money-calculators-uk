/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this project from a subpath:
  // https://sambalnation.github.io/money-calculators-uk/
  // Without a base path, asset URLs resolve from / and you get a white page.
  base: process.env.PUBLIC_BASE_PATH ?? '/money-calculators-uk/',
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
