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
        // El dev server solo se expone en la red local (detrás de Caddy)
        allowedHosts: true,
        proxy: {
            // Redirigir peticiones de API al backend de Elysia en desarrollo
            "/api": {
                // API_PORT viene del .env cargado por `bun --env-file .env`
                target: `http://localhost:${process.env.API_PORT ?? 3000}`,
                changeOrigin: true,
            },
        },
    },
});
