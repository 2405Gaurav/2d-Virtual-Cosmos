import { Message, IMessage } from '../models/Message'
import { ChatMessage } from '../types'

export const messageRepository = {
  async save(msg: ChatMessage): Promise<IMessage> {
    return Message.create(msg)
  },

  async getByRoom(roomId: string, limit = 50): Promise<IMessage[]> {
    return Message.find({ roomId }).sort({ timestamp: -1 }).limit(limit)
  },
}