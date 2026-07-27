import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  root: path.resolve(__dirname, 'sidepanel'),
  build: {
    outDir: path.resolve(__dirname, 'dist', 'sidepanel'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@shared/hamsters': path.resolve(__dirname, '..', 'workshop', 'src', 'data', 'hamsters.js'),
      '@shared/foods': path.resolve(__dirname, '..', 'workshop', 'src', 'data', 'foods.js'),
      '@shared/chatFallback': path.resolve(__dirname, '..', 'workshop', 'src', 'utils', 'chatFallback.js'),
      '@shared/diary': path.resolve(__dirname, '..', 'workshop', 'src', 'data', 'diary.js'),
    },
  },
});
