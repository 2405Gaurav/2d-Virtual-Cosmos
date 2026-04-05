import './config/env'           // load + validate env first
import { createServer } from 'http'
import { Server } from 'socket.io'
import { app } from './app'
import { connectDatabase } from './config/database'
import { setupSocketHandlers } from './socket/handlers'
import { ProximityService } from './services/ProximityService'
import { DatabaseService } from './services/DatabaseService'
import {
  UserState, ServerToClientEvents, ClientToServerEvents,
  InterServerEvents, SocketData,
} from './types'
import { ENV } from './config/env'

const httpServer = createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: { origin: ENV.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },  
})

const activeUsers      = new Map<string, UserState>()
const proximityService = new ProximityService()
const dbService        = new DatabaseService()

setupSocketHandlers(io, activeUsers, proximityService, dbService)

const start = async () => {
  await connectDatabase(ENV.MONGODB_URI)
  httpServer.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`)
    console.log(`🌐 Client: ${ENV.CLIENT_URL}`)
    console.log(`🔧 Mode: ${ENV.NODE_ENV}`)
  })
}

process.on('SIGINT',  () => { dbService.cleanup(); process.exit(0) })
process.on('SIGTERM', () => { dbService.cleanup(); process.exit(0) })

start()