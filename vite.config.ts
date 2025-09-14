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
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:8100',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/docs': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/symbols': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/trades': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/ohlc': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/ticker': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/market': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
