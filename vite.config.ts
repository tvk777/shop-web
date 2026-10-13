import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // loadEnv reads .env files and real environment variables (Vercel settings).
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL is not set. Set it in the Vercel project settings ' +
        '(or in .env locally), for example https://your-api.onrender.com',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
