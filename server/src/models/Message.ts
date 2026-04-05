import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage extends Document {
  id:         string    // ← add
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
// Note: Mongoose's Document already has a built-in `id` (string version of _id)
// so we don't add it to the Schema — just declare it in the interface above

MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 })

export const Message = mongoose.model<IMessage>('Message', MessageSchema)