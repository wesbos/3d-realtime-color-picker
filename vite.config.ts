import { defineConfig } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  server: {
    port: 5556,
    host: true,
    allowedHosts: ['local.wesbos.com'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
