import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Node types are unavailable in this environment
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
