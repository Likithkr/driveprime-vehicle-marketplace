import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // bind to 0.0.0.0
    port: 5173,        // your existing port
    allowedHosts: [
      'native-broad-officially-acid.trycloudflare.com'
    ]
  },
})


// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,      // bind to 0.0.0.0 — accessible via localhost and LAN IP
//     port: 5173,   // matches existing router NAT rule (port 5173 → 192.168.1.3:5173)
//   },
// })