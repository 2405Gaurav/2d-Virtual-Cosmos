import { Server, Socket } from 'socket.io'
import {
  UserState, ChatMessage,
  ServerToClientEvents, ClientToServerEvents,
  InterServerEvents, SocketData,
} from '../types'
import { ProximityService } from '../services/ProximityService'
import { DatabaseService } from '../services/DatabaseService'

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

const prevNearby = new Map<string, string[]>()

async function handleProximity(
  socket: AppSocket,
  io: AppServer,
  activeUsers: Map<string, UserState>,
  proximity: ProximityService
) {
  const nearbyIds = proximity.getNearbyUsers(socket.id, activeUsers)
  const prev      = prevNearby.get(socket.id) ?? []

  const changed =
    nearbyIds.length !== prev.length ||
    nearbyIds.some(id => !prev.includes(id))

  if (!changed) return

  prevNearby.set(socket.id, nearbyIds)
  socket.emit('proximity:update', nearbyIds)

  // Sync rooms
  const oldRooms = proximity.getRoomsForUser(socket.id, prev)
  const newRooms = proximity.getRoomsForUser(socket.id, nearbyIds)
  for (const r of oldRooms) { if (!newRooms.includes(r)) socket.leave(r) }
  for (const r of newRooms) { socket.join(r) }

  // Update the other affected users too
  const affected = [...new Set([...prev, ...nearbyIds])]
  for (const otherId of affected) {
    const otherSocket = io.sockets.sockets.get(otherId)
    if (!otherSocket) continue

    const otherNearby = proximity.getNearbyUsers(otherId, activeUsers)
    const otherPrev   = prevNearby.get(otherId) ?? []
    const otherChanged =
      otherNearby.length !== otherPrev.length ||
      otherNearby.some(id => !otherPrev.includes(id))

    if (!otherChanged) continue

    prevNearby.set(otherId, otherNearby)
    otherSocket.emit('proximity:update', otherNearby)

    const otherOld = proximity.getRoomsForUser(otherId, otherPrev)
    const otherNew = proximity.getRoomsForUser(otherId, otherNearby)
    for (const r of otherOld) { if (!otherNew.includes(r)) otherSocket.leave(r) }
    for (const r of otherNew) { otherSocket.join(r) }
  }
}

export function setupSocketHandlers(
  io: AppServer,
  activeUsers: Map<string, UserState>,
  proximity: ProximityService,
  dbService: DatabaseService
) {
  io.on('connection', async (socket: AppSocket) => {
    const username = (socket.handshake.query.username as string) || 'Anonymous'
    console.log(`🔌 ${username} connected (${socket.id})`)

   const { color, lastX, lastY, icon, bio } = await dbService.upsertUser(username)

    const user: UserState = {
      id: socket.id, username, color,
      icon, bio,     
      x: lastX, y: lastY,
      connectedAt: new Date(),
    }

    activeUsers.set(socket.id, user)

    // Bootstrap the new user with everyone already online
    const others = Array.from(activeUsers.values()).filter(u => u.id !== socket.id)
    socket.emit('users:init', others)

    // Tell everyone else
    socket.broadcast.emit('user:joined', user)

    socket.on('user:move', async ({ x, y }) => {
      const current = activeUsers.get(socket.id)
      if (!current) return
      activeUsers.set(socket.id, { ...current, x, y })
      socket.broadcast.emit('user:moved', { ...current, x, y })
      await handleProximity(socket, io, activeUsers, proximity)
    })

    socket.on('chat:send', async ({ text }) => {
      const sender = activeUsers.get(socket.id)
      if (!sender || !text.trim()) return

      const nearby = prevNearby.get(socket.id) ?? []
      if (nearby.length === 0) return

      const roomId = proximity.getRoomsForUser(socket.id, nearby)[0]
      const msg: ChatMessage = {
        senderId: socket.id,
        senderName: sender.username,
        text: text.trim(),
        roomId,
        timestamp: new Date(),
      }

      io.to(roomId).emit('chat:message', msg)
      dbService.saveMessage(msg).catch(console.error)
    })

    socket.on('disconnect', async () => {
      console.log(`❌ ${username} disconnected`)
      const u = activeUsers.get(socket.id)
      if (u) await dbService.updateLastPosition(username, u.x, u.y)
      activeUsers.delete(socket.id)
      prevNearby.delete(socket.id)
      io.emit('user:left', socket.id)
    })

    // New event handler inside io.on('connection'):
socket.on('user:update-profile', async ({ icon, bio }: { icon: string; bio: string }) => {
  const current = activeUsers.get(socket.id)
  if (!current) return

  // Sanitise
  const safeIcon = icon.slice(0, 8)   // one emoji max
  const safeBio  = bio.slice(0, 120)

  activeUsers.set(socket.id, { ...current, icon: safeIcon, bio: safeBio })
  await dbService.updateProfile(current.username, safeIcon, safeBio)

  // Broadcast so others update their tooltip
  io.emit('user:profile-updated', { id: socket.id, icon: safeIcon, bio: safeBio })
})
  })
}