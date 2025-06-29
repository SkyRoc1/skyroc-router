import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import SkyrocRouter from 'skyroc-router';



// https://vite.dev/config/
export default defineConfig({

  
  plugins: [react(), SkyrocRouter?.default({})],
})
