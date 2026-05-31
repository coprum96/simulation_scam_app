import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const registryPort = Number(process.env.REGISTRY_PORT ?? 3001)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${registryPort}`,
        changeOrigin: true,
      },
    },
  },
})
