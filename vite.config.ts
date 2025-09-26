import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// Load Environment Variables for Vite Config
const DEV_PORT = parseInt(process.env.VITE_DEV_PORT || '8080');
const BACKEND_BASE = process.env.VITE_BACKEND_BASE || 'http://localhost:8100';
const BACKEND_WS = process.env.VITE_BACKEND_WS || 'ws://localhost:8100';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: "::",
    port: DEV_PORT,
    proxy: {
      '/api': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: BACKEND_WS,
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/docs': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/symbols': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/trades': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/ohlc': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/ticker': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      },
      '/market': {
        target: BACKEND_BASE,
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      
      // Feature-spezifische Aliases
      "@trading": path.resolve(__dirname, "./src/features/trading"),
      "@ai": path.resolve(__dirname, "./src/features/ai"),
      "@whales": path.resolve(__dirname, "./src/features/whales"),
      "@enterprise": path.resolve(__dirname, "./src/features/enterprise"),
      "@database": path.resolve(__dirname, "./src/features/database"),
      "@news": path.resolve(__dirname, "./src/features/news"),
      "@api": path.resolve(__dirname, "./src/features/api"),
      "@trading-bot": path.resolve(__dirname, "./src/features/trading-bot"),
      
      // Service-Aliases
      "@services": path.resolve(__dirname, "./src/services"),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
