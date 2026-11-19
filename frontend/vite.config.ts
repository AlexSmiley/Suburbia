import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = { target: "http://localhost:8080", changeOrigin: true };

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/postcodes": backend,
      "^/(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$": backend,
      "^/\\d{4}/\\d{4}$": backend
    }
  }
});
