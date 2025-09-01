import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      'react-speech-to-text-gk': path.resolve(__dirname, '../src/lib/index.ts')
    }
  }
})