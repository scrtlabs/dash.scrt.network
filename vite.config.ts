import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { whip003 } from './vite-plugin-whip-003'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
    tsconfigPaths: true,
    alias: [
      {
        find: '@buf/evmos_evmos.bufbuild_es/evmos/vesting/v1/tx_pb.js',
        replacement: '@buf/evmos_evmos.bufbuild_es/evmos/vesting/v2/tx_pb.js'
      },
      {
        find: '@buf/evmos_evmos.bufbuild_es/evmos/revenue/v1/tx_pb.js',
        replacement: '@evmos/proto/dist/proto/evmos/revenue/v1/tx.js'
      }
    ]
  }
})
