export interface UserState {
  id: string
  username: string
  icon: string   // ← new
  bio: string
  x: number
  y: number
  color: string
  connectedAt: Date
}

export interface ChatMessage {
  senderId: string
  senderName: string
  text: string
  roomId: string
  timestamp: Date
}

// Socket event contracts — frontend must match these exactly
export interface ServerToClientEvents {
  'users:init':           (users: UserState[]) => void
  'user:joined':          (user: UserState) => void
  'user:moved':           (user: UserState) => void
  'user:left':            (id: string) => void
  'proximity:update':     (nearbyIds: string[]) => void
  'chat:message':         (msg: ChatMessage) => void
  'user:profile-updated': (data: { id: string; icon: string; bio: string }) => void  // ← add this
}

export interface ClientToServerEvents {
  'user:move':           (data: { x: number; y: number }) => void
  'chat:send':           (data: { text: string }) => void
  'user:update-profile': (data: { icon: string; bio: string }) => void  // ← add this
}


export interface InterServerEvents { }

export interface SocketData {
  username: string
}