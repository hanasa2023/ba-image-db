export interface IllustResponse {
  title: string
  images: ImageDTO[]
  author: AuthorDTO
}

export interface ImageDTO {
  urls: UrlDTO
  width: number
  weight: number
}

export interface UrlDTO {
  small: string
  regular: string
  original: string
}

export interface AuthorDTO {
  name: string
  id: number
}

export interface IllustDetails {
  id: string
  title: string
  url_big: string
  tags: string[]
  restrict: string
  x_restrict: string
  ai_type: number
  author_details: AuthorDetailsDTO
}

export interface AuthorDetailsDTO {
  user_id: string
  user_name: string
}
