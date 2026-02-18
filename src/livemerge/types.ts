export type UserPreferences = {
  displayName: string
  favoriteCategory: string
  autoJoin: boolean
}

export type StreamInput = {
  title?: string
  originalUrl: string
  embedUrl: string
  chatUrl: string
}

export type Stream = StreamInput & {
  id: string
}

export type LiveStatus = 'live' | 'upcoming' | 'offline' | 'unknown'
