import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import tsconfigPaths from 'vite-tsconfig-paths'
import { whip003 } from './vite-plugin-whip-003'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths(), whip003()],
  server: {
    host: true,
    port: 3000
  }
})
