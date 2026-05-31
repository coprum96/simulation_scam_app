import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, 'data', 'users.json')

const SESSION_TTL_MS = 1000 * 60 * 60 * 12

/** Stateless sessions for Vercel serverless (no shared in-memory store). */
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'scam-app-ru-demo-session-secret-do-not-use-in-production'

let usersCache = null

const DEMO_USERS = [
  {
    id: 'user_viewer',
    username: 'viewer',
    password: 'viewer',
    displayName: 'Наблюдатель',
    role: 'viewer',
  },
  {
    id: 'user_editor',
    username: 'editor',
    password: 'editor',
    displayName: 'Редактор',
    role: 'editor',
  },
  {
    id: 'user_publisher',
    username: 'publisher',
    password: 'publisher',
    displayName: 'Публикатор',
    role: 'publisher',
  },
]

async function loadUsers() {
  if (usersCache) return usersCache
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8')
    usersCache = JSON.parse(raw)
    return usersCache
  } catch {
    usersCache = DEMO_USERS
    return usersCache
  }
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return null
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text.trim()) return null
  return JSON.parse(text)
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  }
}

function signSessionPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const dot = token.indexOf('.')
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  if (sig.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!parsed?.u || typeof parsed.exp !== 'number') return null
    if (parsed.exp < Date.now()) return null
    return {
      token,
      user: parsed.u,
      expiresAt: new Date(parsed.exp).toISOString(),
    }
  } catch {
    return null
  }
}

export function createSession(user) {
  const expiresAtMs = Date.now() + SESSION_TTL_MS
  const publicUser = toPublicUser(user)
  const token = signSessionPayload({ u: publicUser, exp: expiresAtMs })
  return { token, user: publicUser, expiresAt: new Date(expiresAtMs).toISOString() }
}

export function destroySession(_token) {
  // Stateless tokens — client clears token; no server-side session store on serverless.
}

export async function authenticateRequest(req) {
  const header = req.headers.authorization ?? req.headers.Authorization
  if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null
  }
  const token = header.slice(7).trim()
  return verifySignedToken(token)
}

export async function handleAuthRoutes(req, res, url) {
  const { pathname } = url

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody(req)
    const username = body?.username?.trim()
    const password = body?.password
    if (!username || !password) {
      return json(res, 400, { error: 'invalid_credentials' }), true
    }
    const users = await loadUsers()
    const user = users.find((u) => u.username === username && u.password === password)
    if (!user) {
      return json(res, 401, { error: 'invalid_credentials' }), true
    }
    const session = createSession(user)
    return json(res, 200, session), true
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    return json(res, 200, { ok: true }), true
  }

  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const session = await authenticateRequest(req)
    if (!session) return json(res, 401, { error: 'unauthorized' }), true
    return json(res, 200, {
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
    }), true
  }

  return false
}
