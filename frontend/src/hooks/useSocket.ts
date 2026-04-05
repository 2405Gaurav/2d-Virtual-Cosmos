import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCosmosStore } from '../store/useCosmosStore'

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

export function useSocket(username: string) {
  const socketRef = useRef<Socket | null>(null)
  const { setMyId, updateRemoteUser, removeRemoteUser,
          setNearbyUsers, addMessage, setSocket } = useCosmosStore()

  useEffect(() => {
    const socket = io(SOCKET_URL, { query: { username } })
    socketRef.current = socket
      setSocket(socket)

    socket.on('connect', () => {
      setMyId(socket.id!)
    })
//on -->> listening for events from the server and updating the global state accordingly


    // Another user's position updated
    socket.on('user:moved', (user) => {
      updateRemoteUser(user)
    })

    // New user joined
    socket.on('user:joined', (user) => {
      updateRemoteUser(user)
    })

    // User left
    socket.on('user:left', (id: string) => {
      removeRemoteUser(id)
    })

    // All current users on join
    socket.on('users:init', (users) => {
      users.forEach(updateRemoteUser)
    })

    // Proximity updates from server
    socket.on('proximity:update', (nearbyIds: string[]) => {
      setNearbyUsers(nearbyIds)
    })

    // Chat message received
    socket.on('chat:message', (msg) => {
      addMessage(msg)
    })

    return () => { socket.disconnect() }
  }, [username])

  return socketRef
}