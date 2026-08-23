import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { appBaseRedirectPlugin } from './server/appBaseRedirectPlugin.ts'
import { imageSearchPlugin } from './server/imageSearchPlugin.ts'
import { normalizeAppBase } from './src/lib/appBase.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeAppBase(env.VITE_BASE)

  return {
    base,
    plugins: [react(), imageSearchPlugin(), appBaseRedirectPlugin(base)],
    // Listen on all interfaces so other devices on the LAN can open the app.
    server: {
      host: true,
      port: 5173,
      proxy: {
        // Local Kokoro-FastAPI (docker/kokoro) — avoids browser CORS in dev.
        '/api/kokoro': {
          target: 'http://127.0.0.1:8880',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kokoro/, ''),
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api/kokoro': {
          target: 'http://127.0.0.1:8880',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kokoro/, ''),
        },
      },
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
  }
})
