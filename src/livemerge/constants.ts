import type { Stream, UserPreferences } from './types/types'

export const STORAGE_KEYS = {
  preferences: 'livemerge.preferences',
  streams: 'livemerge.streams',
  joinedStreams: 'livemerge.joinedStreams',
  customSortOrder: 'livemerge.customSortOrder',
  userToken: 'livemerge.userToken',
  channels: 'livemerge.channels',
  sortMode: 'livemerge.sortMode',
  tokenExpireDate: 'livemerge.tokenExpireDate'
} as const

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: '',
  favoriteCategory: '',
  autoJoin: false
}

export const EMPTY_STREAM_INPUT = {
  title: '',
  originalUrl: '',
  embedUrl: '',
  chatUrl: ''
}

export const DEFAULT_STREAMS: Stream[] = [
  {
    id: 'stream-1',
    title: 'Lo-fi Focus Stream',
    originalUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    chatUrl: 'https://www.youtube.com/live_chat?v=jfKfPfyJRdk'
  },
  {
    id: 'stream-2',
    title: 'Nature Live Cam',
    originalUrl: 'https://www.youtube.com/watch?v=X2Uul2SBLsE',
    embedUrl: 'https://www.youtube.com/embed/X2Uul2SBLsE',
    chatUrl: 'https://www.youtube.com/live_chat?v=X2Uul2SBLsE'
  }
]
