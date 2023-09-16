import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    vercel(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      manifest: {
        name: '定期タスク管理',
        short_name: '定期タスク管理',
        lang: 'ja',
        description: '定期的なタスクを管理するためのアプリケーション',
        start_url: '/',
        background_color: '#2f3d58',
        theme_color: '#2f3d58',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            porpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            porpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
