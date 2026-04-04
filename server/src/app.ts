import express from 'express'
import { corsMiddleware } from './middleware/cors'

const app = express()

app.use(corsMiddleware)
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export { app }