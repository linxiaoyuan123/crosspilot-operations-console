import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

const apiTarget = process.env.CROSSPILOT_API || 'http://127.0.0.1:3100';

export default defineConfig({
  site: process.env.SITE_URL || 'http://127.0.0.1:3100',
  output: 'static',
  trailingSlash: 'always',
  integrations: [svelte()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.WEB_PORT || 4321)
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': apiTarget,
        '/uploads': apiTarget
      }
    }
  },
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto'
  }
});
