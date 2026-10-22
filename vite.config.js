import { defineConfig } from 'vite';

// HireShield AI – plain HTML/CSS/vanilla JS, Vite only as dev server
export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787'
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
});
