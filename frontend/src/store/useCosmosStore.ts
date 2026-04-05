import { create } from 'zustand'
import { Socket } from 'socket.io-client'

export interface RemoteUser {
  id: string
  username: string
  x: number
  y: number
  color: string
}

export interface ChatMessage {
  senderId: string
  senderName: string
  text: string
  timestamp: number
}

interface CosmosStore {
    username: string | null      // ← add
  setUsername: (name: string) => void  // ← add
  myId: string | null
  myPosition: { x: number; y: number }
  remoteUsers: Map<string, RemoteUser>
  nearbyUsers: string[]           // socket IDs in proximity
  chatMessages: ChatMessage[]
  isChatOpen: boolean
   socket: Socket | null
  setSocket: (socket: Socket) => void

  setMyId: (id: string) => void
  setMyPosition: (pos: { x: number; y: number }) => void
  updateRemoteUser: (user: RemoteUser) => void
  removeRemoteUser: (id: string) => void
  setNearbyUsers: (ids: string[]) => void
  addMessage: (msg: ChatMessage) => void
  setChatOpen: (open: boolean) => void
}

export const useCosmosStore = create<CosmosStore>((set) => ({
  username: null,
setUsername: (name) => set({ username: name }),
  myId: null,
  myPosition: { x: 400, y: 300 },
  remoteUsers: new Map(),
  nearbyUsers: [],
  chatMessages: [],
  isChatOpen: false,
    socket: null,                                          // ← add this
  setSocket: (socket) => set({ socket }),   

  setMyId: (id) => set({ myId: id }),
  setMyPosition: (pos) => set({ myPosition: pos }),
  updateRemoteUser: (user) => set((s) => {
    const m = new Map(s.remoteUsers)
    m.set(user.id, user)
    return { remoteUsers: m }
  }),
  removeRemoteUser: (id) => set((s) => {
    const m = new Map(s.remoteUsers)
    m.delete(id)
    return { remoteUsers: m }
  }),
  setNearbyUsers: (ids) => set({ nearbyUsers: ids, isChatOpen: ids.length > 0 }),
  addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatOpen: (open) => set({ isChatOpen: open }),
}))