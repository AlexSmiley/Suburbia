import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = {
  target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001",
  changeOrigin: true
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/postcodes": backend,
      "^/(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$": backend,
      "^/\\d{1,10}/\\d{1,10}$": backend
    }
  },
  build: {
    outDir: "../node-api/public",
    emptyOutDir: true
  }
});
