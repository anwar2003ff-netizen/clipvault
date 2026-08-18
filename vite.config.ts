import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Capacitor loads the built app from a local file:// / capacitor:// origin,
// so paths must be relative, not absolute.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the "@/*" path in tsconfig.json so the bundler (not just
      // the TypeScript type-checker) knows how to resolve these imports.
      '@': path.resolve(__dirname, 'src'),
    },
  },
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
