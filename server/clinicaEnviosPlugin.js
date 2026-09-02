function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => {
      chunks.push(chunk)
    })

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function createClinicaEnviosHandler(env) {
  return async function handle(req, res, next) {
    const path = req.url?.split('?')[0]

    if (path !== '/api/clinica-envios') {
      next?.()
      return
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Use POST.' })
      return
    }

    const apiKey = env.CLINICA_API_KEY
    const oticaUrl = (env.OTICA_API_URL || 'https://controleoticasvitales.online').replace(/\/$/, '')

    if (!apiKey) {
      sendJson(res, 500, {
        error: 'Configure CLINICA_API_KEY no arquivo .env da clínica.',
      })
      return
    }

    try {
      const body = await readJsonBody(req)
      const response = await fetch(`${oticaUrl}/api/clinica-envios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'x-clinica-key': apiKey,
        },
        body: JSON.stringify(body),
      })

      const text = await response.text()
      let payload = text

      try {
        payload = JSON.parse(text)
      } catch {
        payload = { message: text }
      }

      sendJson(res, response.status, payload)
    } catch (error) {
      sendJson(res, 502, {
        error: 'Não foi possível falar com a ótica.',
        detail: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

export function clinicaEnviosPlugin(env) {
  const handle = createClinicaEnviosHandler(env)

  return {
    name: 'clinica-envios',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}
