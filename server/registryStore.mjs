import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sanitizeStore } from './sanitize.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'registry.json')

const EMPTY_STORE = {
  schemaVersion: 1,
  scenarios: {},
  riskRules: {},
  auditLog: [],
}

export function getDataFilePath() {
  return DATA_FILE
}

export async function readRegistryStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed.schemaVersion !== 1) return structuredClone(EMPTY_STORE)
    return sanitizeStore({
      schemaVersion: 1,
      scenarios: parsed.scenarios ?? {},
      riskRules: parsed.riskRules ?? {},
      auditLog: parsed.auditLog ?? [],
      migratedFromLocalAt: parsed.migratedFromLocalAt ?? null,
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return structuredClone(EMPTY_STORE)
    }
    throw error
  }
}

export async function writeRegistryStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const payload = {
    schemaVersion: 1,
    scenarios: store.scenarios ?? {},
    riskRules: store.riskRules ?? {},
    auditLog: store.auditLog ?? [],
    migratedFromLocalAt: store.migratedFromLocalAt ?? null,
  }
  await fs.writeFile(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return payload
}

export function listVersions(map, id) {
  const versions = map[id] ?? []
  return [...versions].sort((a, b) => a.version - b.version)
}

export function upsertVersion(map, id, doc) {
  const versions = map[id] ?? []
  const next = versions.filter((v) => v.version !== doc.version)
  next.push(doc)
  map[id] = next.sort((a, b) => a.version - b.version)
}

export function removeVersion(map, id, version) {
  const versions = map[id]
  if (!versions) return
  const next = versions.filter((v) => v.version !== version)
  if (next.length === 0) delete map[id]
  else map[id] = next
}

export function latestPublished(versions) {
  const published = versions.filter((v) => v.status === 'published')
  return published.sort((a, b) => b.version - a.version)[0]
}
