import { handleRequest } from '../server/handlers.mjs'

export const config = {
  runtime: 'nodejs',
}

/**
 * Vercel serverless catch-all for /api/* — same handlers as local registry.
 * Writable data uses server/data (ephemeral on serverless; use local dev for persistence).
 */
export default async function handler(req, res) {
  const incoming = req.url ?? '/'
  const pathname = incoming.startsWith('/api')
    ? incoming
    : `/api${incoming.startsWith('/') ? incoming : `/${incoming}`}`
  req.url = pathname
  await handleRequest(req, res)
}
