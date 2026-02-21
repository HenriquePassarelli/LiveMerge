import type { StreamInput } from '../types/types'
import { normalizeYoutubeUrl } from './youtube.utils'

const normalizeEmbedUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(trimmed)
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch {
      return trimmed
    }
  }

  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0]
    if (id) return `https://www.youtube.com/embed/${id}`
  }

  return trimmed
}

const normalizeChatUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(trimmed)
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`
    } catch {
      return trimmed
    }
  }

  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0]
    if (id) return `https://www.youtube.com/live_chat?v=${id}`
  }

  return trimmed
}

export const normalizeStreamInput = (input: StreamInput | string): Omit<StreamInput, 'title'> => {
  if (typeof input === 'string') {
    const originalUrl = normalizeYoutubeUrl(input)

    return {
      originalUrl: originalUrl,
      embedUrl: normalizeEmbedUrl(originalUrl),
      chatUrl: normalizeChatUrl(originalUrl)
    }
  }

  const originalUrl = normalizeYoutubeUrl(input.originalUrl)

  return {
    ...input,
    embedUrl: normalizeEmbedUrl(originalUrl),
    chatUrl: normalizeChatUrl(originalUrl),
    originalUrl: originalUrl
  }
}
