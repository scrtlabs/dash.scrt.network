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
  },
  resolve: {
    alias: {
      // Redirect the broken import from @evmos/transactions
      '@buf/evmos_evmos.bufbuild_es/evmos/vesting/v1/tx_pb.js': '@buf/evmos_evmos.bufbuild_es/evmos/vesting/v2/tx_pb.js'
    }
  }
})
