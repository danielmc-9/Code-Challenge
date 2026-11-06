import './env.js'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { createTmdbApi } from './api.js'

const root = resolve('dist')
const api = createTmdbApi({ token: process.env.API_KEY_THEMOVIEDB })
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
}
const server = createServer((req, res) =>
  api(req, res, async () => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405).end()
        return
      }
      const pathname = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname
      )
      if (pathname.split('/').some((segment) => segment.startsWith('.'))) {
        res.writeHead(404).end('Not found')
        return
      }
      let file = resolve(root, '.' + pathname)
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end()
        return
      }
      if (!extname(pathname)) file = resolve(root, 'index.html')
      const content = await readFile(file)
      res.setHeader(
        'Content-Type',
        mime[extname(file)] || 'application/octet-stream'
      )
      res.end(req.method === 'HEAD' ? undefined : content)
    } catch {
      res.writeHead(404).end('Not found')
    }
  })
)
server.listen(Number(process.env.PORT) || 3000, () =>
  console.log('App server ready.')
)
