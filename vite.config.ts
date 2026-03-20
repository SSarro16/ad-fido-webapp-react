import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'GOOGLE_MAPS_'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react-router') || id.includes('@remix-run')) {
            return 'router-vendor';
          }

          if (
            id.includes('@tanstack/react-query') ||
            id.includes('zustand') ||
            id.includes('zod')
          ) {
            return 'data-vendor';
          }

          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'motion-vendor';
          }

          if (id.includes('lucide-react')) {
            return 'ui-vendor';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
