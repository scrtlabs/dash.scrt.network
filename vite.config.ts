import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { whip003 } from './vite-plugin-whip-003'

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
  },
  build: {
    minify: 'esbuild'
  }
})
