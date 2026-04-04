import { User, IUser } from '../models/User'

export const userRepository = {
  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username })
  },

  async create(username: string, color: string): Promise<IUser> {
    return User.create({ username, color })
  },

  async updatePosition(username: string, x: number, y: number): Promise<void> {
    await User.updateOne({ username }, { lastX: x, lastY: y, lastSeen: new Date() })
  },
}