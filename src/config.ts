import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config()

const envSchema = z.object({
    REDIS_URL: z.string().url(),
})

const parsedEnv = envSchema.parse(process.env)

export const env = parsedEnv