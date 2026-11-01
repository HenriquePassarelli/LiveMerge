import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Runs the Cloudflare Pages Functions in functions/api/ inside the Vite dev server,
// so `yarn dev` alone serves /api/channel and /api/video (no wrangler needed locally).
const pagesFunctionsDev = (): Plugin => ({
  name: 'pages-functions-dev',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res) => {
      try {
        const url = new URL(req.originalUrl ?? '', `http://${req.headers.host ?? 'localhost'}`)
        const name = url.pathname.replace(/^\/api\//, '')

        if (!/^[a-z-]+$/.test(name)) {
          res.statusCode = 404
          res.end()
          return
        }

        const mod = await server.ssrLoadModule(`/functions/api/${name}.ts`)
        const response: Response = await mod.onRequestGet({ request: new Request(url, { method: 'GET' }) })

        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      } catch (error) {
        console.error('[pages-functions-dev]', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Function failed' }))
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesFunctionsDev()]
})
