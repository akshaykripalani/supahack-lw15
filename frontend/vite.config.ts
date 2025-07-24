import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // IPv4 loopback to avoid ::1 binding
    port: 5178,       // outside Hyper-V reserved range 5078-5177
  },
})
