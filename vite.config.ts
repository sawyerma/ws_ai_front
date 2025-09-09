import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // Keep /api prefix for backend
      },
      '/ws': {
        target: 'ws://localhost:8100',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, '/ws') // Keep /ws prefix for backend
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@trading": path.resolve(__dirname, "./src/features/trading"),
      "@database": path.resolve(__dirname, "./src/features/database"),
      "@ai": path.resolve(__dirname, "./src/features/ai"),
      "@whales": path.resolve(__dirname, "./src/features/whales"),
      "@news": path.resolve(__dirname, "./src/features/news"),
      "@api": path.resolve(__dirname, "./src/features/api"),
      "@trading-bot": path.resolve(__dirname, "./src/features/trading-bot"),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
