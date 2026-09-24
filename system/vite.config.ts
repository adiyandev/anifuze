import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';

export default defineConfig({
  base: '/anifuze/',
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      'react-router-dom': resolve(process.cwd(), 'node_modules/react-router-dom'),
      'lucide-react': resolve(process.cwd(), 'node_modules/lucide-react'),
      react: resolve(process.cwd(), 'node_modules/react'),
    },
  },
  server: {
    fs: {allow: ['..']},
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
