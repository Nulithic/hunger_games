import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { imageSearchPlugin } from './server/imageSearchPlugin.ts'

export default defineConfig({
  plugins: [react(), imageSearchPlugin()],
  // Listen on all interfaces so other devices on the LAN can open the app.
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.{ts,tsx}', 'src/App.tsx'],
    },
  },
})
