import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    'process.env': {}
  },

  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer"
    }
  },

  optimizeDeps: {
    exclude: [
      "snarkjs",        // prevent pre-bundling from breaking WASM loading
      "fastfile",
      "@iden3/binfileutils",
      "ffjavascript",
      "circom_runtime"
    ]
  }
})
