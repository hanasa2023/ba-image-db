import path from 'path'
import { env } from '../config'

export const BASE_URL = 'https://www.pixiv.net'
export const PAGE_FILE = path.resolve(__dirname, '../../currentPage.txt')
export const getOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Referer: 'https://www.pixiv.net/',
    Cookie: env.Cookie || '',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41',
  },
}
