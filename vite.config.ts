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
    // The default minifier is esbuild, which is fast and effective.
    // If you need additional options or prefer terser, you can change it.
    minify: 'esbuild',
    // Rollup options allow you to customize code splitting further.
    rollupOptions: {
      output: {
        // Example: Separate vendor code from your app code.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // This creates separate chunks for each dependency folder.
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  }
})
