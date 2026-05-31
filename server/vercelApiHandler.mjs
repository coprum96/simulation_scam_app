import { handleRequest } from './handlers.mjs'

export const config = {
  runtime: 'nodejs',
}

/**
 * Reconstruct /api/... pathname for Vercel (single-function proxy).
 */
export function resolveApiPathname(req) {
  const fromQuery = req.query?.path
  if (fromQuery != null && fromQuery !== '') {
    const segments = Array.isArray(fromQuery) ? fromQuery : String(fromQuery).split('/')
    const joined = segments.filter(Boolean).join('/')
    return joined ? `/api/${joined}` : '/api'
  }

  const incoming = req.url ?? '/'
  if (incoming.startsWith('/api/')) return incoming.split('?')[0]
  if (incoming.startsWith('/api')) return incoming.split('?')[0]

  try {
    const url = new URL(incoming, `http://${req.headers?.host ?? 'localhost'}`)
    if (url.pathname.startsWith('/api')) return url.pathname
  } catch {
    // ignore
  }

  return '/api'
}

export default async function vercelApiHandler(req, res) {
  req.url = resolveApiPathname(req)
  await handleRequest(req, res)
}
