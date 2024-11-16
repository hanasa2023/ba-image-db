import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  REDIS_URL: z.string().url(),
  Cookie: z.string() || '',
})

const parsedEnv = envSchema.parse(process.env)

export const env = parsedEnv
