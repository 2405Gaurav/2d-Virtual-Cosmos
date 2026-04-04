import mongoose from 'mongoose'

export const connectDatabase = async (mongoUri: string): Promise<void> => {
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'))
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err))