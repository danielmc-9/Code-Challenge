import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import './server/env.js'
import { createTmdbApi } from './server/api.js'

const api = createTmdbApi({ token: process.env.API_KEY_THEMOVIEDB })
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tmdb-backend',
      configureServer(server) {
        server.middlewares.use(api)
      },
      configurePreviewServer(server) {
        server.middlewares.use(api)
      },
    },
  ],
})
