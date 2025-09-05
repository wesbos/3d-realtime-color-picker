import { defineConfig } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    cloudflare({  }),
    react()

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
