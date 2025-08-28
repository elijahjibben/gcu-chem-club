import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // Map `@` to the project src directory without relying on Node.js
      // URL utilities so the config can compile in environments that
      // lack Node type definitions.
      '@': '/src',
    },
  },
})
