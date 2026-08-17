import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3002,
      proxy: {
        '/auth': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/phcs': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/patients': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/pregnancies': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/antenatal-visits': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/vaccines': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/immunizations': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/nutrition-records': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicines': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicine-batches': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicine-transactions': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicine-stock': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/dashboard': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/reports': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/priority-visits': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/health-risks': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/health-alerts': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicine-forecasts': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/audit-logs': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/roles': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/settings': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/admin-dashboard-stats': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/ehr-records': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/sync': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/alerts': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/ai': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/households': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
        '/medicine-issues': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
