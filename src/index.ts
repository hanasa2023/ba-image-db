import { env } from './config'
import { logger } from './utils/logger'
import { RedisDatabase } from './db/database'
import { fetchWithRetry } from './utils/fetch-with-retry'
import { BASE_URL, getOptions, PAGE_FILE } from './utils/constants'
import { saveCurrentPage, getCurrentPage } from './utils/failed-handle'
import fs from 'fs'
import { SearchResponse } from './types/search-response'

async function index() {
  const getTotal = await fetchWithRetry(
    `${BASE_URL}/ajax/search/illustrations/ブルーアーカイブ1000users入り?word=ブルーアーカイブ1000users入り&order=date_d&mode=all&csw=0&s_mode=s_full_tag&type=all&lang=zh`,
    getOptions,
  )
  let total = 0
  let lastPage = 0
  if (getTotal.ok) {
    const json = await getTotal.json()
    total = json.body.illust.total
    lastPage = json.body.illust.lastPage
  }
  logger.info(`Total: ${total}, Last Page: ${lastPage}`)
  if (total === 0) throw new Error('Total is 0')

  const url = env.REDIS_URL
  const redis = new RedisDatabase(url)
  await redis.connect()
  await redis.setTotal(total)

  let startPage = await getCurrentPage()

  for (let i = startPage - 1; i < lastPage; i++) {
    logger.info(`Page: ${i + 1}`)
    try {
      const response = await fetchWithRetry(
        `${BASE_URL}/ajax/search/illustrations/ブルーアーカイブ1000users入り?word=ブルーアーカイブ1000users入り&order=date_d&mode=all&p=${
          i + 1
        }&csw=0&s_mode=s_full_tag&type=all&lang=zh`,
        getOptions,
      )
      if (response.ok) {
        const json: SearchResponse = (await response.json()).body.illust
        await redis.setData(json)
        await saveCurrentPage(i)
      }
    } catch (error) {
      logger.error(`Error processing page ${i + 1}: ${error}`)
      await saveCurrentPage(i) // Save the current page before exiting
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
