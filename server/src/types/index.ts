export interface UserState {
  id: string
  username: string
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
  'user:joined':      (user: UserState) => void
  'user:left':        (id: string) => void
  'user:moved':       (user: UserState) => void
  'users:init':       (users: UserState[]) => void
  'proximity:update': (nearbyIds: string[]) => void
  'chat:message':     (msg: ChatMessage) => void
}

export interface ClientToServerEvents {
  'user:move': (pos: { x: number; y: number }) => void
  'chat:send': (data: { text: string }) => void
}

export interface InterServerEvents {}

export interface SocketData {
  username: string
}