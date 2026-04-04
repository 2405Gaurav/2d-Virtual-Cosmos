import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage extends Document {
  senderId:   string
  senderName: string
  text:       string
  roomId:     string
  timestamp:  Date
}

const MessageSchema = new Schema<IMessage>({
  senderId:   { type: String, required: true },
  senderName: { type: String, required: true },
  text:       { type: String, required: true },
  roomId:     { type: String, required: true },
  timestamp:  { type: Date,   default: Date.now },
})

// Auto-delete messages after 24 hours
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 })

export const Message = mongoose.model<IMessage>('Message', MessageSchema)