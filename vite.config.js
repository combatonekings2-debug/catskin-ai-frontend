import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const customDomainBanner = () => ({
  name: 'custom-domain-banner',
  configureServer(server) {
    const _print = server.printUrls;
    server.printUrls = () => {
      _print.call(server);
      const port = server.config.server.port || 5173;
      console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mDomain:\x1b[0m  \x1b[36mhttp://catskinai:${port}/\x1b[0m`);
    };
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), customDomainBanner()],
  server: {
    allowedHosts: true,
    host: true,
    port: 5173,
    proxy: {
      // Gunakan 127.0.0.1 eksplisit (bukan 'localhost') untuk hindari IPv6 ::1
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
          ],
          'icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
