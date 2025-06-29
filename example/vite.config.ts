import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import SkyrocRouter from 'skyroc-router';
import { fileURLToPath } from 'node:url';



// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [react(), SkyrocRouter?.default({})],
})
