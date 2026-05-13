import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@web": path.resolve(__dirname, "./src"),
            "@shared": path.resolve(
                __dirname,
                "../../packages/shared-types/src",
            ),
            "@validators": path.resolve(
                __dirname,
                "../../packages/validators/src",
            ),
            "@ui": path.resolve(__dirname, "../../packages/ui/src"),
        },
    },
    server: {
        port: 5173,
        host: true,
        allowedHosts: [
            "192.168.0.19",
            "localhost",
            "127.0.0.1",
            "host.docker.internal",
        ],
        proxy: {
            // Redirigir peticiones de API al backend de Elysia en desarrollo
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
