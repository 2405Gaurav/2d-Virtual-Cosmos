export interface UserState {
  id: string
  username: string
  icon: string
  bio: string
  x: number
  y: number
  color: string
  connectedAt: Date
}

export interface ChatMessage {  
  id: string  
  senderId: string
  senderName: string
  text: string
  roomId: string
  timestamp: Date
}

// socket event types, frontend needs to match these
export interface ServerToClientEvents {
  'users:init':           (users: UserState[]) => void
  'user:joined':          (user: UserState) => void
  'user:moved':           (user: UserState) => void
  'user:left':            (id: string) => void
  'proximity:update':     (nearbyIds: string[]) => void
  'chat:message':         (msg: ChatMessage) => void
  'user:profile-updated': (data: { id: string; icon: string; bio: string }) => void
   'chat:typing':      (data: { senderId: string; senderName: string }) => void
  'chat:stopTyping':  (data: { senderId: string }) => void                  
}

export interface ClientToServerEvents {
  'user:move':           (data: { x: number; y: number }) => void
  'chat:send':           (data: { text: string }) => void
  'user:update-profile': (data: { icon: string; bio: string }) => void
   'chat:typing':      () => void
  'chat:stopTyping':  () => void
}


export interface InterServerEvents { }

export interface SocketData {
  username: string
}