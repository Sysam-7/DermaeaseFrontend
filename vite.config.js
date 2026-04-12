import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where your Express API listens (must match backend PORT). If backend uses PORT=3000, set VITE_PROXY_TARGET=http://localhost:3000
  const proxyTarget = env.VITE_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget.replace(/\/$/, ''),
          changeOrigin: true,
        },
      },
    },
  };
});


