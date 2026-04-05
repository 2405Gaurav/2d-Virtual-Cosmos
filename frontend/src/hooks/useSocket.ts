import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCosmosStore } from '../store/useCosmosStore'

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

export function useSocket(username: string) {
  const socketRef = useRef<Socket | null>(null)
  const { setMyId, updateRemoteUser, removeRemoteUser,
          setNearbyUsers, addMessage, setSocket, setTyping, clearTyping} = useCosmosStore()

  useEffect(() => {
    const socket = io(SOCKET_URL, { query: { username } })
    socketRef.current = socket
      setSocket(socket)

    socket.on('connect', () => {
      setMyId(socket.id!)
    })

    // listning to server events and syncing state

    socket.on('user:moved', (user) => {
      updateRemoteUser(user)
    })

    socket.on('user:joined', (user) => {
      updateRemoteUser(user)
    })

    socket.on('user:left', (id: string) => {
      removeRemoteUser(id)
        clearTyping(id)
    })

    // get all current users when we first connect
    socket.on('users:init', (users) => {
      users.forEach(updateRemoteUser)
    })

  socket.on('proximity:update', (nearbyIds: string[]) => {
  const prevNearby = useCosmosStore.getState().nearbyUsers
  const leftProximity = prevNearby.filter(id => !nearbyIds.includes(id))
  leftProximity.forEach(id => clearTyping(id))

  setNearbyUsers(nearbyIds)
})

    socket.on('chat:message', (msg) => {
      addMessage(msg)
    })

    // handle when somone updates their profile
socket.on('user:profile-updated', ({ id, icon, bio }) => {
  useCosmosStore.setState(state => {
    const user = state.remoteUsers.get(id)
    if (user) {
      const updated = new Map(state.remoteUsers)
      updated.set(id, { ...user, icon, bio })
      return { remoteUsers: updated }
    }
    if (id === state.myId) return { myIcon: icon, myBio: bio }
    return {}
  })
})

socket.on('chat:typing', ({ senderId, senderName }) => {
  setTyping(senderId, senderName)
})

socket.on('chat:stopTyping', ({ senderId }) => {
  clearTyping(senderId)
})

    return () => { socket.disconnect() }
  }, [username])

  return socketRef
}