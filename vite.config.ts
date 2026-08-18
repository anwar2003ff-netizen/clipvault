import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Capacitor loads the built app from a local file:// / capacitor:// origin,
// so paths must be relative, not absolute.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true, // reachable from other devices on the same network (test on phone browser)
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Keep chunks small-ish; this app has no heavy dependency tree.
    chunkSizeWarningLimit: 800,
  },
})
