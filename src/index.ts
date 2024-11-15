import { env } from './config'
import { logger } from './utils/logger'
import { RedisDatabase } from './db/database'
import { fetchWithRetry } from './utils/fetch-with-retry'

async function index() {
  const getTotal = await fetchWithRetry(
    'https://pixiv-api.hanasaki.tech/search',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: 'ブルーアーカイブ ',
        blt: 1000,
      }),
    },
  )
  let total = 0
  if (getTotal.ok) {
    const json = await getTotal.json()
    total = json.total
  }
  const lastPage = Math.ceil(total / 60)
  logger.info(`Total: ${total}, Last Page: ${lastPage}`)

  const url = env.REDIS_URL
  // logger.info(`Redis URL: ${url}`)
  const redis = new RedisDatabase(url)
  await redis.connect()
  await redis.setTotal(total)
  for (const i of Array(lastPage).keys()) {
    // if (i < 10) continue
    logger.info(`Page: ${i + 1}`)
    const response = await fetchWithRetry(
      'https://pixiv-api.hanasaki.tech/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: 'ブルーアーカイブ ',
          blt: 1000,
          p: i + 1,
        }),
      },
    )
    if (response.ok) {
      const json = await response.json()
      await redis.setData(json)
    }
  }
  await redis.disconnect()
}

index().catch(console.error)
