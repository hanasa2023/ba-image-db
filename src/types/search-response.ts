export interface SearchResponse {
  data: SearchResult[]
}

export interface SearchResult {
  id: string
  title: string
  tags: string[]
}
