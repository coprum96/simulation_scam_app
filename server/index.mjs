import http from 'node:http'
import { handleRequest } from './handlers.mjs'
import { getDataFilePath } from './registryStore.mjs'
import { getSessionArchiveFilePath } from './sessionArchiveStore.mjs'

const PORT = Number(process.env.REGISTRY_PORT ?? 3001)

const server = http.createServer((req, res) => {
  void handleRequest(req, res)
})

server.listen(PORT, () => {
  console.log(`Authoring registry API: http://localhost:${PORT}`)
  console.log(`Storage: ${getDataFilePath()}`)
  console.log(`Session archive: ${getSessionArchiveFilePath()}`)
})
