import {  defineConfig } from 'vite'
import { resolve } from "path";
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-obfuscator';


//https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir:"../app",
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true,
      },
      mangle: {
        
        toplevel: true,
        reserved: ['React', 'ReactDOM', 'window', 'document'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        user: resolve(__dirname, 'user-app.html'),
        dashboard: resolve(__dirname, 'dashboard-app.html'),
      }
    },
  },
  server: {
    middlewareMode: 'html',
  },
})

