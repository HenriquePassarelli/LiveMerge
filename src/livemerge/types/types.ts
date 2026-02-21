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
  channelId?: string
}

export type Stream = StreamInput & {
  id: string
  isLive?: boolean
}

export type ChannelInput = {
  channelId: string
}

export type LiveStatus = 'live' | 'upcoming' | 'offline' | 'unknown'

export type SortMode = 'default' | 'title-asc' | 'title-desc' | 'custom'
