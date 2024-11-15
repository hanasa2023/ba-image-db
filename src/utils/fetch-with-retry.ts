import {logger} from "./logger";

export async function fetchWithRetry(url: string, options: RequestInit, retries: number = 5, timeout: number = 10000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            if (response.ok) {
                return response;
            }
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            logger.warn(`Retrying fetch (${i + 1}/${retries})...`);
        }
    }
    throw new Error('Failed to fetch after multiple retries');
}