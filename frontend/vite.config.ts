import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// L'URL de l'API en production
const PROD_API_URL = 'https://qynmg4r7csdhkfx7b66vhirnvq0shygn.lambda-url.us-west-2.on.aws';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: PROD_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
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
    // En production, on remplace /api par l'URL complète
    'process.env.API_BASE_URL': command === 'serve' 
      ? JSON.stringify('/api')
      : JSON.stringify(PROD_API_URL)
  }
}));