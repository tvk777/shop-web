import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// vercel.json cannot read env vars, so the API origin in its CSP connect-src is
// written by hand. Fail the build when it does not match VITE_API_URL, instead of
// shipping a site whose API calls are blocked by the browser.
function checkCspConnectSrc(apiUrl: string) {
  let origin: string
  let hostname: string
  try {
    ;({ origin, hostname } = new URL(apiUrl))
  } catch {
    throw new Error(`VITE_API_URL is not a valid URL: "${apiUrl}"`)
  }
  // A local build against the dev API is not deployed, so there is no CSP to match.
  if (['localhost', '127.0.0.1', '[::1]'].includes(hostname)) return

  const file = path.resolve(import.meta.dirname, 'vercel.json')
  const config = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
    headers?: { headers?: { key: string; value: string }[] }[]
  }
  const csp = config.headers
    ?.flatMap((rule) => rule.headers ?? [])
    .find((h) => h.key.toLowerCase() === 'content-security-policy')?.value
  const connectSrc = csp
    ?.split(';')
    .map((directive) => directive.trim().split(/\s+/))
    .find(([name]) => name === 'connect-src')
    ?.slice(1)

  if (!connectSrc?.includes(origin)) {
    throw new Error(
      `The API origin ${origin} (from VITE_API_URL) is missing from connect-src in ` +
        `vercel.json (Content-Security-Policy header). The browser would block ` +
        `every API request. Add ${origin} to connect-src, or fix VITE_API_URL. ` +
        `Current connect-src: ${connectSrc ? connectSrc.join(' ') : 'not found'}`,
    )
  }
}

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
  if (command === 'build') checkCspConnectSrc(env.VITE_API_URL)

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          // Vite 8 bundles with Rolldown, which has no manualChunks: use codeSplitting groups.
          // Shared libraries get their own chunk, so app code changes do not invalidate it.
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|scheduler|react-router|@tanstack[\\/]react-query|@tanstack[\\/]query-core|axios|radix-ui|@radix-ui)[\\/]/,
              },
              // Form libraries in their own chunk, so the vendor chunk stays under 500 kB.
              {
                name: 'forms',
                test: /node_modules[\\/](react-hook-form|zod|@hookform[\\/]resolvers)[\\/]/,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
