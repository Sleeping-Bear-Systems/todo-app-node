import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  appType: 'custom',
  plugins: [
    devServer({
      entry: 'src/index.ts', // Your Hono application entry
    }),
  ],
  build: {
    rollupOptions: {
      input: 'src/index.ts',
    },
  },
})