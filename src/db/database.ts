import {createClient} from "redis";
import {logger} from "../utils/logger";
import {SearchResponse} from "../types/search-response";
import {processBar} from "../utils/process-bar";

export class RedisDatabase {
    private _client

    constructor(url: string) {
        this._client = createClient({url}).on("error", (error) => {
            logger.error(error)
        })
    }

    async connect() {
        if (!this._client.isOpen) {
            logger.info('Connecting to Redis')
            await this._client.connect()
            logger.info('Connected to Redis')
        }
    }

    async setTotal(total: number) {
        await this.connect()
        logger.info('Setting total')
        await this._client.set("baImg:total", total)
        logger.info('Total set successfully!')
    }

    async setData(res: SearchResponse) {
        await this.connect()
        logger.info('Setting data')
        processBar.start(res.results.length, 0)
        for (const [index, r] of res.results.entries()) {
            processBar.update(index + 1)
            const tags = r.tags
            const strId = r.id.toString()
            for (const tag of tags) {
                const exists = await this._client.sIsMember(`baTag:${tag}`, strId)
                if (!exists) {
                    await this._client.sAdd(`baTag:${tag}`, strId)
                } else {
                    // logger.info(`Data already exists for tag: ${tag}, skip id: ${strId}`)
                }
            }
        }
        processBar.stop()
        logger.info('Data set successfully!')
    }

    async getIdByTags(tags: string[]) {
        await this.connect()
        const keys = tags.map(t => `baTag:${t}`)
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
}