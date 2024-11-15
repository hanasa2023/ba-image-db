import { env } from './config'
import { logger } from './utils/logger'
import { RedisDatabase } from './db/database'
import { fetchWithRetry } from './utils/fetch-with-retry'
import { BASE_URL, PAGE_FILE } from './utils/constants'
import { saveCurrentPage, getCurrentPage } from './utils/failed-handle'
import fs from 'fs'

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
  const lastPage = Math.ceil(total / 60)
  logger.info(`Total: ${total}, Last Page: ${lastPage}`)
  if (total === 0) throw new Error('Total is 0')

  const url = env.REDIS_URL
  const redis = new RedisDatabase(url)
  await redis.connect()
  await redis.setTotal(total)

  let startPage = await getCurrentPage()

  for (let i = startPage; i < lastPage; i++) {
    logger.info(`Page: ${i + 1}`)
    try {
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
    } catch (error) {
      logger.error(`Error processing page ${i + 1}: ${error}`)
      await saveCurrentPage(i + 1) // Save the current page before exiting
      process.exit(1) // Exit with a non-zero status code on error
    }
  }
  await redis.disconnect()
  fs.unlinkSync(PAGE_FILE) // 删除文件表示任务完成
}

index().catch((error) => {
  console.error(error)
  process.exit(1) // Exit with a non-zero status code on error
})
