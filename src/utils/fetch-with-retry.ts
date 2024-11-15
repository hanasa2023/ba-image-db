import { logger } from './logger'

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 5,
  timeout: number = 10000,
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
        logger.warn(
          `Fetch failed with status: ${response.status}. Retrying (${
            i + 1
          }/${retries})...`,
        )
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
