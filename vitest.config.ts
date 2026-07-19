import path from 'node:path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@site': path.resolve(__dirname),
      '@site/src': path.resolve(__dirname, 'src'),
      '@docusaurus/BrowserOnly': path.resolve(
        __dirname,
        'node_modules/@docusaurus/core/lib/client/exports/BrowserOnly.js',
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    passWithNoTests: true,
  },
})
