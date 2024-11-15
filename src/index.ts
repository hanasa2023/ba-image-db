import { env } from './config'
import { logger } from './utils/logger'
import { RedisDatabase } from './db/database'
import { fetchWithRetry } from './utils/fetch-with-retry'
import { BASE_URL } from './utils/constants'
import { getCurrentPage, saveCurrentPage } from './utils/failed-handle'

async function index() {
  const getTotal = await fetchWithRetry(`${BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      word: 'ブルーアーカイブ ',
      blt: 1000,
    }),
  })
  let total = 0
  if (getTotal.ok) {
    const json = await getTotal.json()
    total = json.total
  }
  if (total === 0) process.exit(-1)
  const lastPage = Math.ceil(total / 60)
  logger.info(`Total: ${total}, Last Page: ${lastPage}`)

  const url = env.REDIS_URL
  // logger.info(`Redis URL: ${url}`)
  const redis = new RedisDatabase(url)
  await redis.setTotal(total)

  let startPage = await getCurrentPage()
  for (let i = startPage - 1; i < lastPage; i++) {
    // if (i < 10) continue
    logger.info(`Page: ${i + 1}`)
    const response = await fetchWithRetry(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: 'ブルーアーカイブ ',
        blt: 1000,
        p: i + 1,
      }),
    })
    if (response.ok) {
      const json = await response.json()
      await redis.setData(json)
      await saveCurrentPage(i + 1)
    }
  }
}

index()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
