import { env } from './config'
import { logger } from './utils/logger'
import { RedisDatabase } from './db/database'
import { fetchWithRetry } from './utils/fetch-with-retry'
import { BASE_URL, PAGE_FILE } from './utils/constants'
import { saveCurrentPage, getCurrentPage } from './utils/failed-handle'
import fs from 'fs'
import { SearchResponse } from './types/search-response'

async function index() {
  // const getTotal = await fetchWithRetry(`${BASE_URL}/search`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     word: 'ブルーアーカイブ ',
  //     blt: 1000,
  //   }),
  // })
  const getTotal = await fetchWithRetry(
    `${BASE_URL}/ajax/search/illustrations/ブルーアーカイブ 1000users入り?word=ブルーアーカイブ 1000users入り&order=date_d&mode=all&csw=0&s_mode=s_tag&type=all&lang=zh`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie:
          'p_ab_id=5; p_ab_id_2=5; p_ab_d_id=1961806571; PHPSESSID=51330307_lwVaBvuF3wx6hujTCrcpWHnqDXmcETOB; device_token=a5c2f33246ddf4a11f630b510c95afca; c_type=20; privacy_policy_agreement=0; privacy_policy_notification=0; a_type=1; b_type=2; first_visit_datetime_pc=2024-11-14%2014%3A03%3A51; yuid_b=OCABdSA; cf_clearance=5z2_kcAcunVYJro47cEQeIer8qdGeMbfX2XHQeexCqo-1731642746-1.2.1.1-X1OQeqB.3c.BS4CmDFt2qjZkUuJ_RAJPQf218xp74EYnDHPpTdS2B6Y7X6EdUcDng3u1cQ74HHTP3r1pok.uOdfxZDyIGUo0lam4vp.v4BFi5JwojRdy6rhlewwlk6sOII2M4Vc6B.Z6XWNuc8PnWkwY.uMfIx8BQ6SpHWliL8dmd1nAuZbFXzD6Y93D3Z0mzQ0DN8eiUEv_gybGPlJ4bVrIVl6AMWTNrvzHBpNPBNF5RUnlVKM6iDM6iELzzcOzgJs0nt8dcxfbXnC.MACPcfJ3YZ7eYdkXdb9h7K4xGyNc7kYbvGXLdYIgonAqdHnsBKXBTgCsQr2TgnhT5eZKauXDElt4xEITIgzwfUvqB3ucSQGokB3aUCC7E.cLg7el; __cf_bm=u2XlmlHsODoHejdQi1B.aJAEU6KpOU2PgWPj702qmxA-1731693464-1.0.1.1-0LQuKo6CoaKNJGABYdzp_dTpUeDEgWWNjXMcsklNxy5LS5sMMO4GMI2Lko0qfcXpLU78K.tNrBqftrpZD3FnlwA6W3LBgs42.TRy3epDorg',
      },
    },
  )
  let total = 0
  if (getTotal.ok) {
    const json = await getTotal.json()
    total = json.body.illust.total
  }
  const lastPage = Math.ceil(total / 60)
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
      // const response = await fetchWithRetry(`${BASE_URL}/search`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     word: 'ブルーアーカイブ ',
      //     blt: 1000,
      //     p: i + 1,
      //   }),
      // })
      const response = await fetchWithRetry(
        `${BASE_URL}/ajax/search/illustrations/ブルーアーカイブ 1000users入り?word=ブルーアーカイブ 1000users入り&order=date_d&mode=all&${
          i + 1
        }&csw=0&s_mode=s_tag&type=all&lang=zh`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Cookie:
              'p_ab_id=5; p_ab_id_2=5; p_ab_d_id=1961806571; PHPSESSID=51330307_lwVaBvuF3wx6hujTCrcpWHnqDXmcETOB; device_token=a5c2f33246ddf4a11f630b510c95afca; c_type=20; privacy_policy_agreement=0; privacy_policy_notification=0; a_type=1; b_type=2; first_visit_datetime_pc=2024-11-14%2014%3A03%3A51; yuid_b=OCABdSA; cf_clearance=5z2_kcAcunVYJro47cEQeIer8qdGeMbfX2XHQeexCqo-1731642746-1.2.1.1-X1OQeqB.3c.BS4CmDFt2qjZkUuJ_RAJPQf218xp74EYnDHPpTdS2B6Y7X6EdUcDng3u1cQ74HHTP3r1pok.uOdfxZDyIGUo0lam4vp.v4BFi5JwojRdy6rhlewwlk6sOII2M4Vc6B.Z6XWNuc8PnWkwY.uMfIx8BQ6SpHWliL8dmd1nAuZbFXzD6Y93D3Z0mzQ0DN8eiUEv_gybGPlJ4bVrIVl6AMWTNrvzHBpNPBNF5RUnlVKM6iDM6iELzzcOzgJs0nt8dcxfbXnC.MACPcfJ3YZ7eYdkXdb9h7K4xGyNc7kYbvGXLdYIgonAqdHnsBKXBTgCsQr2TgnhT5eZKauXDElt4xEITIgzwfUvqB3ucSQGokB3aUCC7E.cLg7el; __cf_bm=u2XlmlHsODoHejdQi1B.aJAEU6KpOU2PgWPj702qmxA-1731693464-1.0.1.1-0LQuKo6CoaKNJGABYdzp_dTpUeDEgWWNjXMcsklNxy5LS5sMMO4GMI2Lko0qfcXpLU78K.tNrBqftrpZD3FnlwA6W3LBgs42.TRy3epDorg',
          },
        },
      )
      if (response.ok) {
        const json: SearchResponse = (await response.json()).body.illust
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
