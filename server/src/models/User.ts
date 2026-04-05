import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  color:    string
  icon:     string
  bio:      string
  lastX:    number
  lastY:    number
  lastSeen: Date
}
const COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#10b981','#ef4444']
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  color:    { type: String, default: () => COLORS[Math.floor(Math.random() * COLORS.length)] },
  icon:     { type: String, default: '👤' },
  bio:      { type: String, default: '' },
  lastX:    { type: Number, default: 400 },
  lastY:    { type: Number, default: 300 },
  lastSeen: { type: Date,   default: Date.now },
})

export const User = mongoose.model<IUser>('User', UserSchema)