import { logger } from './logger'

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 5,
  timeout: number = 20000,
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeout)
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(id)
      if (response.ok) {
        return response
      } else {
        if (response.status === 400) {
          logger.error(
            `Fetch failed with status: ${response.status}. Bad Request, not retrying.`,
          )
          throw new Error(
            `Fetch failed with status: ${response.status}. Bad Request, not retrying.`,
          )
        }
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : 3 * 60000 // Default to 60 seconds if no Retry-After header
          logger.warn(
            `Fetch failed with status: ${
              response.status
            }. Too Many Requests, retrying after ${waitTime / 1000} seconds...`,
          )
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        } else {
          logger.warn(
            `Fetch failed with status: ${response.status}. Retrying (${
              i + 1
            }/${retries})...`,
          )
        }
      }
    } catch (error) {
      logger.warn(`Fetch error: ${error}. Retrying (${i + 1}/${retries})...`)
      if (i === retries - 1) {
        throw error
      }
    }
  }
  throw new Error('Failed to fetch after multiple retries')
}
