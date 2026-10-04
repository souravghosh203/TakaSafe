import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  // Surge hosts this app at the domain root. Keep that build independent of
  // the /TakaSafe/ base path used by the GitHub Pages workflow.
  const base = mode === 'surge' ? '/' : process.env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/]/,
                minSize: 30_000,
                maxSize: 300_000,
              },
              {
                name: 'app',
                test: /src[\\/]/,
                minSize: 100_000,
                maxSize: 300_000,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
