// YouTube API Search Response Types
type YouTubeThumbnail = {
  url: string
  width?: number
  height?: number
}

type YouTubeSnippet = {
  publishedAt: string
  title: string
  description: string
  thumbnails: {
    default?: YouTubeThumbnail
    medium?: YouTubeThumbnail
    high?: YouTubeThumbnail
  }
  channelTitle: string
  liveBroadcastContent: 'live' | 'upcoming' | 'none'
  publishTime: string
  channelId: string
}

type YouTubeVideoId = {
  kind: 'youtube#video'
  videoId: string
}

type YouTubeSearchItem = {
  kind: 'youtube#searchResult'
  etag: string
  id: YouTubeVideoId
  snippet: YouTubeSnippet
}

export type YouTubeSearchResponse = {
  kind: 'youtube#searchListResponse'
  etag: string
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubeSearchItem[]
}
