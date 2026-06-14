import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/notifications": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error(
              "[vite proxy] /api/notifications → http://127.0.0.1:3001",
              err.message
            );
          });
        },
      },
      "/health": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error(
              "[vite proxy] /health → http://127.0.0.1:3001",
              err.message
            );
          });
        },
      },
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
