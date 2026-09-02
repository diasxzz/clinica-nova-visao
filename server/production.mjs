import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClinicaEnviosHandler } from './clinicaEnviosPlugin.js'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const port = Number(process.env.PORT) || 4173
const handleApi = createClinicaEnviosHandler(process.env)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.statusCode = status
  res.setHeader('Content-Type', type)
  res.end(body)
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
  const filePath = join(dist, relative)
  const safePath = normalize(filePath)

  if (!safePath.startsWith(normalize(dist))) {
    send(res, 403, 'Forbidden')
    return
  }

  try {
    const data = await readFile(safePath)
    send(res, 200, data, mime[extname(safePath)] || 'application/octet-stream')
  } catch {
    const index = await readFile(join(dist, 'index.html'))
    send(res, 200, index, mime['.html'])
  }
}

createServer(async (req, res) => {
  const path = req.url?.split('?')[0]

  if (path === '/api/clinica-envios') {
    await handleApi(req, res, () => {})
    return
  }

  await serveStatic(req, res)
}).listen(port, '0.0.0.0', () => {
  console.log(`Clínica Nova Visão em http://0.0.0.0:${port}`)
})
