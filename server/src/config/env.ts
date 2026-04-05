import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT:         process.env.PORT         || '3001',
  MONGODB_URI:  process.env.MONGODB_URI  || '',
  CLIENT_URL:   process.env.CLIENT_URL   || 'http://localhost:5173',
  NODE_ENV:     process.env.NODE_ENV     || 'development',
}

// crash early if mongo uri is missing, no point running without it
if (!ENV.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env')
  process.exit(1)
}