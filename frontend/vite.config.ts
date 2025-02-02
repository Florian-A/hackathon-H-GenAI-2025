import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// URLs des APIs
const STRUCTURE_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/get-describe-all-table/'
const CONTROLS_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/get-all-pipeline-output/'
const SQL_EXEC_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/exec-sql-data/'

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
      },
      '/api/sql-exec': {
        target: SQL_EXEC_API_URL,
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