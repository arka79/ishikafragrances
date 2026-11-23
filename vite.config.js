import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// The admin page is served at /admin in both dev and production.
const adminRoute = () => ({
  name: 'admin-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url.startsWith('/admin?') || req.url === '/admin/') {
        req.url = '/admin.html';
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), adminRoute()],
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        admin: `${root}admin.html`,
      },
    },
  },
});
