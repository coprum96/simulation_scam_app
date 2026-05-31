import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, 'data', 'users.json')

const SESSION_TTL_MS = 1000 * 60 * 60 * 12
const sessions = new Map()

let usersCache = null

async function loadUsers() {
  if (usersCache) return usersCache
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  usersCache = JSON.parse(raw)
  return usersCache
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

export function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  sessions.set(token, {
    token,
    expiresAt,
    user: toPublicUser(user),
  })
  return { token, user: toPublicUser(user), expiresAt }
}

export function destroySession(token) {
  sessions.delete(token)
}

export async function authenticateRequest(req) {
  const header = req.headers.authorization ?? req.headers.Authorization
  if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null
  }
  const token = header.slice(7).trim()
  const session = sessions.get(token)
  if (!session) return null
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
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
    const session = await authenticateRequest(req)
    if (session) destroySession(session.token)
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
