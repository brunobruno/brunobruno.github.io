import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Deployed as a GitHub user site (brunobruno.github.io), so assets resolve from the root.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: 'index.html' },
    },
  },
})
