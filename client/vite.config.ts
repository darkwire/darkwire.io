import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const projectRootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'istanbul',
    },
  },
  resolve: {
    alias: [{ find: '@', replacement: resolve(projectRootDir, 'src') }],
  },
  build:{
    chunkSizeWarningLimit: 1000
  }
});
