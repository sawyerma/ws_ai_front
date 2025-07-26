import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api':       'http://localhost:8100',
      '/ohlc':      'http://localhost:8100',
      '/orderbook': 'http://localhost:8100',
      '/symbols':   'http://localhost:8100'
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src"
    },
  },
})
