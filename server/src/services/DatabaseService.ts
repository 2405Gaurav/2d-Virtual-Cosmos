import { userRepository } from '../repository/userRepository'
import { messageRepository } from '../repository/messageRepository'
import { ChatMessage } from '../types'

const COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#10b981','#ef4444']

export class DatabaseService {
 async upsertUser(username: string): Promise<{ color: string; lastX: number; lastY: number; icon: string; bio: string }> {
  try {
    let user = await userRepository.findByUsername(username)
    if (!user) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      user = await userRepository.create(username, color)
    }
    return { color: user.color, lastX: user.lastX, lastY: user.lastY, icon: user.icon, bio: user.bio }
  } catch {
    return { color: COLORS[0], lastX: 400, lastY: 300, icon: '👤', bio: '' }
  }
}

  async updateLastPosition(username: string, x: number, y: number): Promise<void> {
    await userRepository.updatePosition(username, x, y)
  }

  async saveMessage(msg: ChatMessage): Promise<void> {
    await messageRepository.save(msg)
  }
  async updateProfile(username: string, icon: string, bio: string): Promise<void> {
  await userRepository.updateProfile(username, icon, bio)
}

  cleanup(): void {
    console.log('🧹 Cleanup done')
  }
}