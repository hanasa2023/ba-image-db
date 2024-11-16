import { RedisDatabase } from '../db/database'
import { env } from '../config'
import { logger } from './logger'

async function fix() {
  const db = new RedisDatabase(env.REDIS_URL)
  await db.fixDB()
}

fix().catch((error) => {
  logger.error(error)
  process.exit(1)
})
