export interface SearchResponse {
  results: SearchResult[]
}

export interface SearchResult {
  id: number
  title: string
  tags: string[]
}
