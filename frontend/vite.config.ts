import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// URLs des APIs
const STRUCTURE_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/get-describe-all-table/';
const CONTROLS_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/get-all-pipeline-output/';
const SQL_EXEC_API_URL = 'https://2307tm7mb3.execute-api.us-west-2.amazonaws.com/api/exec-sql-data/';

export default defineConfig(({ command, mode }) => ({
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
        rewrite: (path) => path.replace(/^\/api\/sql-exec/, '')
      }
    }
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
    'process.env.STRUCTURE_API_URL': JSON.stringify(STRUCTURE_API_URL),
    'process.env.CONTROLS_API_URL': JSON.stringify(CONTROLS_API_URL),
    'process.env.SQL_EXEC_API_URL': JSON.stringify(SQL_EXEC_API_URL)
  }
}));