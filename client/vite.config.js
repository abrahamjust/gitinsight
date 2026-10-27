import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend has no CORS setup and uses cookie sessions, so the dev server
// proxies /api/* to it. That keeps everything same-origin, and the /api prefix
// stops proxied paths from colliding with client-side routes on refresh.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: process.env.VITE_API_TARGET || "http://localhost:3000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
