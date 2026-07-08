import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/local-subscription-radar/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
});
