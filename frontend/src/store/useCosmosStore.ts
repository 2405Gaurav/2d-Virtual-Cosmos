import { create } from 'zustand'
import { Socket } from 'socket.io-client'

export interface RemoteUser {
  id:       string
  username: string
  x:        number
  y:        number
  color:    string
  icon:     string   // ← new
  bio:      string   // ← new
}

export interface ChatMessage {
   id: string  
  senderId:   string
  senderName: string
  text:       string
  timestamp:  number
}

interface CosmosStore {
  // ── Identity ──────────────────────────────────────────────────
  username:    string | null
  setUsername: (name: string) => void

  // ── Local user profile ────────────────────────────────────────
  icon:    string
  bio:     string
  setIcon: (icon: string) => void   // ← was missing from interface
  setBio:  (bio: string)  => void   // ← was missing from interface

  // ── Position & peers ──────────────────────────────────────────
  myId:              string | null
  myPosition:        { x: number; y: number }
  remoteUsers:       Map<string, RemoteUser>
  nearbyUsers:       string[]
  chatMessages:      ChatMessage[]
  isChatOpen:        boolean

  // ── Socket ────────────────────────────────────────────────────
  socket:    Socket | null
  setSocket: (socket: Socket) => void

  // ── Actions ───────────────────────────────────────────────────
  setMyId:          (id: string) => void
  setMyPosition:    (pos: { x: number; y: number }) => void
  updateRemoteUser: (user: RemoteUser) => void
  removeRemoteUser: (id: string) => void
  setNearbyUsers:   (ids: string[]) => void
  addMessage:       (msg: ChatMessage) => void
  setChatOpen:      (open: boolean) => void

  // Profile update coming in from another user via socket
  updateRemoteProfile: (id: string, icon: string, bio: string) => void  // ← new


  //typing indicators
    typingUsers: Map<string, string>           // ← add: socketId → username
  setTyping:   (id: string, name: string) => void  // ← add
  clearTyping: (id: string) => void                 // ← add
}

export const useCosmosStore = create<CosmosStore>((set) => ({
  // ── Identity ──────────────────────────────────────────────────
  username:    null,
  setUsername: (name) => set({ username: name }),

  // ── Local user profile ────────────────────────────────────────
  icon:    '👤',   // ← sensible default instead of null
  bio:     '',
  setIcon: (icon) => set({ icon }),
  setBio:  (bio)  => set({ bio }),

  // ── Position & peers ──────────────────────────────────────────
  myId:         null,
  myPosition:   { x: 400, y: 300 },
  remoteUsers:  new Map(),
  nearbyUsers:  [],
  chatMessages: [],
  isChatOpen:   false,

  // ── Socket ────────────────────────────────────────────────────
  socket:    null,
  setSocket: (socket) => set({ socket }),

  // ── Actions ───────────────────────────────────────────────────
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

  setNearbyUsers: (ids) => set({ nearbyUsers: ids, isChatOpen: ids.length > 0 }),
  addMessage:     (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatOpen:    (open) => set({ isChatOpen: open }),

  // Patches icon/bio on a remote user without touching their position/color
  updateRemoteProfile: (id, icon, bio) => set((s) => {
    const existing = s.remoteUsers.get(id)
    if (!existing) return {}
    const m = new Map(s.remoteUsers)
    m.set(id, { ...existing, icon, bio })
    return { remoteUsers: m }
  }),

//typing indicators
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