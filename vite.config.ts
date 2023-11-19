import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { whip003 } from './vite-plugin-whip-003'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { ...react() },
    { ...tsconfigPaths() },
    {
      ...whip003(),
      apply: 'build'
    }
  ],
  server: {
    host: true,
    port: 3000
  }
})
