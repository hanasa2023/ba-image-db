import fs from 'fs'
import { PAGE_FILE } from './constants'

export async function saveCurrentPage(page: number) {
  fs.writeFileSync(PAGE_FILE, page.toString(), 'utf-8')
}

export async function getCurrentPage(): Promise<number> {
  if (fs.existsSync(PAGE_FILE)) {
    const page = fs.readFileSync(PAGE_FILE, 'utf-8')
    return parseInt(page, 1)
  }
  return 0
}
