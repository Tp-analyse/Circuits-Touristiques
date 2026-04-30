import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 8000,
    proxy: {
      "/api": {
        target: "https://serveur-b0cxhcg0c4bsgyez.germanywestcentral-01.azurewebsites.net",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});