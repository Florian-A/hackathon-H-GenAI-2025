import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// URLs des APIs
const STRUCTURE_API_URL = 'https://j3cxokj4wray522ke5syfmyxwq0uqdtb.lambda-url.us-west-2.on.aws';
const CONTROLS_API_URL = 'https://qynmg4r7csdhkfx7b66vhirnvq0shygn.lambda-url.us-west-2.on.aws';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/structure': {
        target: STRUCTURE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/structure/, '')
      },
      '/api/controls': {
        target: CONTROLS_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/controls/, '')
      }
    },
    open: 'firefox',
    port: 3000
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    'process.env.API_BASE_URL': command === 'serve'
      ? JSON.stringify('/api')
      : JSON.stringify(CONTROLS_API_URL)
  }
}));