import { createClient } from 'redis'
import { logger } from '../utils/logger'
import { fetchWithRetry } from '../utils/fetch-with-retry'
import { SearchResponse } from '../types/search-response'
import { processBar } from '../utils/process-bar'
import { IllustDetails } from 'src/types/illust-response'
import { BASE_URL, getOptions } from '../utils/constants'
import { delay } from '../utils/failed-handle'
import { parseRedisHash } from '../utils/tools'
import { IllustDTO } from '../types/illust'

export class RedisDatabase {
  private _client

  constructor(url: string) {
    this._client = createClient({ url }).on('error', (error) => {
      logger.error(error)
    })
  }

  async connect(retries: number = 5, timeout: number = 10000) {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this._client.isOpen) {
          await this._client.connect()
          logger.info('Connected to Redis')
          return
        }
      } catch (error) {
        logger.warn(
          `Redis connection error: ${error}. Retrying (${i + 1}/${retries})...`,
        )
        if (i === retries - 1) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, timeout))
      }
    }
  }

  async setTotal(total: number) {
    await this.connect()
    logger.info('Setting total')
    await this._client.set('baImg:total', total)
    await this.disconnect()
    logger.info('Total set successfully!')
  }

  async updateData(res: SearchResponse) {
    await this.connect()
    logger.info('Updating data')
    processBar.start(res.data.length, 0)
    for (const [index, r] of res.data.entries()) {
      processBar.update(index + 1)
      const tags = r.tags
      const strId = r.id
      const existsId = await this._client.exists(`baId:${strId}`)
      if (existsId) break // skip if already exists
      for (const tag of tags) {
        const existsTag = await this._client.sIsMember(`baTag:${tag}`, strId)
        if (!existsTag) {
          await this._client.sAdd(`baTag:${tag}`, strId)
        }
        if (!existsId) {
          const response = await fetchWithRetry(
            `${BASE_URL}/touch/ajax/illust/details?illust_id=${strId}`,
            getOptions,
          )
          if (response.ok) {
            const illust: IllustDetails = (await response.json()).body
              .illust_details
            const tags = illust.tags.reduce((acc: string, cur: string) => {
              return acc + ', ' + cur
            })
            await this._client.sAdd(
              `baImg:${illust.ai_type !== 1 ? 'ai' : 'notAI'}`,
              strId,
            )
            await this._client.sAdd(
              `baImg:${illust.restrict === '0' ? 'safe' : 'r18'}`,
              strId,
            )
            await this._client.del(`baId:${strId}`)
            await this._client.hSet(`baId:${strId}`, 'id', illust.id)
            await this._client.hSet(`baId:${strId}`, 'title', illust.title)
            await this._client.hSet(`baId:${strId}`, 'tags', tags)
            await this._client.hSet(
              `baId:${strId}`,
              'restrict',
              illust.restrict === '0' ? 'safe' : 'r18',
            )
            await this._client.hSet(`baId:${strId}`, 'aiType', illust.ai_type)
            await this._client.hSet(
              `baId:${strId}`,
              'imgUrl',
              illust.url_big.replace('i.pximg.net', 'pximg.hanasaki.tech'),
            )
            await this._client.hSet(
              `baId:${strId}`,
              'author',
              illust.author_details.user_name,
            )
            await this._client.hSet(
              `baId:${strId}`,
              'authorId',
              illust.author_details.user_id,
            )
          }
        }
      }
    }
    processBar.stop()
    const rTags: string[] = ['baTag:R-18G', 'baTag:R-18', 'baTag:R18']
    const rIds = await this._client.sUnion(rTags)
    processBar.start(rIds.length, 0)
    for (const [index, id] of rIds.entries()) {
      processBar.update(index + 1)
      await this._client.hSet(`baId:${id}`, 'restrict', 'r18')
      await this._client.sAdd('baImg:r18', id)
      await this._client.sRem('baImg:safe', id)
    }
    processBar.stop()
    logger.info('Data update successfully!')
    await this.disconnect()
  }

  async setData(res: SearchResponse): Promise<number> {
    let delayTime = 0
    await this.connect()
    logger.info('Setting data')
    processBar.start(res.data.length, 0)
    for (const [index, r] of res.data.entries()) {
      processBar.update(index + 1)
      const tags = r.tags
      const strId = r.id
      const existsId = await this._client.exists(`baId:${strId}`)
      if (!existsId) {
        const response = await fetchWithRetry(
          `${BASE_URL}/touch/ajax/illust/details?illust_id=${strId}`,
          getOptions,
        )
        if (response.ok) {
          const illust: IllustDetails = (await response.json()).body
            .illust_details
          const tags = illust.tags.reduce((acc: string, cur: string) => {
            return acc + ', ' + cur
          })
          await this._client.sAdd(
            `baImg:${illust.ai_type !== 1 ? 'ai' : 'notAI'}`,
            strId,
          )
          await this._client.sAdd(
            `baImg:${illust.restrict === '0' ? 'safe' : 'r18'}`,
            strId,
          )
          await this._client.del(`baId:${strId}`)
          await this._client.hSet(`baId:${strId}`, 'id', illust.id)
          await this._client.hSet(`baId:${strId}`, 'title', illust.title)
          await this._client.hSet(`baId:${strId}`, 'tags', tags)
          await this._client.hSet(
            `baId:${strId}`,
            'restrict',
            illust.restrict === '0' ? 'safe' : 'r18',
          )
          await this._client.hSet(`baId:${strId}`, 'aiType', illust.ai_type)
          await this._client.hSet(
            `baId:${strId}`,
            'imgUrl',
            illust.url_big.replace('i.pximg.net', 'pximg.hanasaki.tech'),
          )
          await this._client.hSet(
            `baId:${strId}`,
            'author',
            illust.author_details.user_name,
          )
          await this._client.hSet(
            `baId:${strId}`,
            'authorId',
            illust.author_details.user_id,
          )
          await delay(1000)
          delayTime = 0
        }
      } else {
        delayTime = 1000
      }
      for (const tag of tags) {
        await this._client.sAdd(`baTag:${tag}`, strId)
      }
    }
    processBar.stop()
    const rTags: string[] = ['baTag:R-18G', 'baTag:R-18', 'baTag:R18']
    const rIds = await this._client.sUnion(rTags)
    processBar.start(rIds.length, 0)
    for (const [index, id] of rIds.entries()) {
      processBar.update(index + 1)
      await this._client.hSet(`baId:${id}`, 'restrict', 'r18')
      await this._client.sAdd('baImg:r18', id)
      await this._client.sRem('baImg:safe', id)
    }
    processBar.stop()
    logger.info('Data set successfully!')
    await this.disconnect()
    return delayTime
  }

  async getIdByTags(tags: string[]) {
    await this.connect()
    const keys = tags.map((t) => `baTag:${t}`)
    return await this._client.sInter(keys)
  }

  async removeData(tags: string[], id: number) {
    await this.connect()
    const strId = id.toString()
    for (const tag of tags) {
      await this._client.sRem(`baTag:${tag}`, strId)
    }
  }

  async disconnect() {
    if (this._client.isOpen) {
      await this._client.disconnect()
    }
  }
  async fixDB() {
    await this.connect()
    const ids = (await this._client.keys('baId:*')).map((id) =>
      id.replace('baId:', ''),
    )
    logger.info('Start fixing DB')
    processBar.start(ids.length, 0)
    for (const [index, id] of ids.entries()) {
      processBar.update(index + 1)
      const illust = await this._client.hGetAll(`baId:${id}`)
      const illustInfo = parseRedisHash<IllustDTO>(illust)
      // 设置baImg:ai/notAI, baImg:safe/r18
      await this._client.sAdd(
        `baImg:${illustInfo.aiType !== 1 ? 'ai' : 'notAI'}`,
        id,
      )
      await this._client.sAdd(
        `baImg:${illustInfo.restrict === 'safe' ? 'safe' : 'r18'}`,
        id,
      )
      processBar.stop()
    }
    // 手动设置r18tag
    const rTags: string[] = ['baTag:R-18G', 'baTag:R-18', 'baTag:R18']
    const rIds = await this._client.sUnion(rTags)
    processBar.start(rIds.length, 0)
    for (const [index, id] of rIds.entries()) {
      processBar.update(index + 1)
      await this._client.hSet(`baId:${id}`, 'restrict', 'r18')
      await this._client.sAdd('baImg:r18', id)
      await this._client.sRem('baImg:safe', id)
    }
    processBar.stop()
    logger.info('DB fixed successfully!')
  }
}
