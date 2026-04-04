import cors from 'cors'
import { ENV } from '../config/env'

export const corsMiddleware = cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
})