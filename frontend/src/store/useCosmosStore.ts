import { create } from 'zustand'
import { Socket } from 'socket.io-client'

export interface RemoteUser {
  id:       string
  username: string
  x:        number
  y:        number
  color:    string
  icon:     string
  bio:      string
}

export interface ChatMessage {
   id: string  
  senderId:   string
  senderName: string
  text:       string
  timestamp:  number
}

// main store for everthing cosmos related
interface CosmosStore {
  username:    string | null
  setUsername: (name: string) => void

  icon:    string
  bio:     string
  setIcon: (icon: string) => void
  setBio:  (bio: string)  => void

  myId:              string | null
  myPosition:        { x: number; y: number }
  remoteUsers:       Map<string, RemoteUser>
  nearbyUsers:       string[]
  chatMessages:      ChatMessage[]
  isChatOpen:        boolean

  socket:    Socket | null
  setSocket: (socket: Socket) => void

  setMyId:          (id: string) => void
  setMyPosition:    (pos: { x: number; y: number }) => void
  updateRemoteUser: (user: RemoteUser) => void
  removeRemoteUser: (id: string) => void
  setNearbyUsers:   (ids: string[]) => void
  addMessage:       (msg: ChatMessage) => void
  setChatOpen:      (open: boolean) => void

  updateRemoteProfile: (id: string, icon: string, bio: string) => void

  // typeing stuff
  typingUsers: Map<string, string>
  setTyping:   (id: string, name: string) => void
  clearTyping: (id: string) => void
}

export const useCosmosStore = create<CosmosStore>((set) => ({
  username:    null,
  setUsername: (name) => set({ username: name }),

  icon:    '👤',
  bio:     '',
  setIcon: (icon) => set({ icon }),
  setBio:  (bio)  => set({ bio }),

  myId:         null,
  myPosition:   { x: 400, y: 300 },
  remoteUsers:  new Map(),
  nearbyUsers:  [],
  chatMessages: [],
  isChatOpen:   false,

  socket:    null,
  setSocket: (socket) => set({ socket }),

  setMyId:       (id)  => set({ myId: id }),
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

 setNearbyUsers: (ids) => set((s) => {
  // remove typing status for ppl who left proximity
  const newTyping = new Map(s.typingUsers)
  s.nearbyUsers.forEach(id => {
    if (!ids.includes(id)) newTyping.delete(id)
  })

  return {
    nearbyUsers: ids,
    isChatOpen: ids.length > 0,
    typingUsers: newTyping,
  }
}),
  addMessage:     (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatOpen:    (open) => set({ isChatOpen: open }),

  // patches profile without messing up position/color
  updateRemoteProfile: (id, icon, bio) => set((s) => {
    const existing = s.remoteUsers.get(id)
    if (!existing) return {}
    const m = new Map(s.remoteUsers)
    m.set(id, { ...existing, icon, bio })
    return { remoteUsers: m }
  }),

  typingUsers: new Map(),
setTyping: (id, name) => set(s => {
  const m = new Map(s.typingUsers)
  m.set(id, name)
  return { typingUsers: m }
}),
clearTyping: (id) => set(s => {
  const m = new Map(s.typingUsers)
  m.delete(id)
  return { typingUsers: m }
}),
}))