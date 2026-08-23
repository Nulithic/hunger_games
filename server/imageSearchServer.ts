import { createServer } from 'node:http'
import { handleImageSearchRequest } from './imageSearchApi.ts'

const host = process.env.IMAGE_SEARCH_HOST ?? '127.0.0.1'
const port = Number(process.env.IMAGE_SEARCH_PORT ?? 4174)

const server = createServer((req, res) => {
  void handleImageSearchRequest(req, res)
})

server.listen(port, host, () => {
  console.log(`Image search listening on http://${host}:${port}`)
})
