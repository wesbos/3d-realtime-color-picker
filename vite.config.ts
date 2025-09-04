import { defineConfig } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({ inspectorPort: false, persistState: false }),

  ],
  server: {
    port: 5556,
    host: true,
    allowedHosts: ['local.wesbos.com', '192.168.1.195'],
  },

  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
