import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/todo-pwa/',
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
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
        start_url: './index.html',
        background_color: '#2f3d58',
        theme_color: '#2f3d58',
        display: 'standalone',
        icons: [
          {
            src: '/icon512.png',
            size: '512x512',
          },
        ],
      },
    }),
  ],
});
