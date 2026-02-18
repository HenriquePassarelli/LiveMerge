import type { StreamInput } from './types'

export const normalizeEmbedUrl = (url: string): string => {
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

export const normalizeChatUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(trimmed)
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/live_chat?v=${videoId}`
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

const normalizeYoutubeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(trimmed)
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`
    } catch {
      return trimmed
    }
  }

  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0]
    if (id) return `https://www.youtube.com/watch?v=${id}`
  }

  return trimmed
}

export const normalizeStreamInput = (input: StreamInput | string): Omit<StreamInput, 'title'> => {
  if (typeof input === 'string') {
    return normalizeStreamInput({
      originalUrl: input,
      embedUrl: normalizeEmbedUrl(input),
      chatUrl: normalizeChatUrl(input)
    })
  }

  return {
    ...input,
    embedUrl: normalizeEmbedUrl(input.embedUrl),
    chatUrl: normalizeChatUrl(input.chatUrl),
    originalUrl: normalizeYoutubeUrl(input.originalUrl)
  }
}

export const getYouTubeVideoId = (url: string): string | null => {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const hostname = parsed.hostname.replace('www.', '')

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1] || null
      }

      if (parsed.pathname.startsWith('/live/')) {
        return parsed.pathname.split('/live/')[1] || null
      }
    }
  } catch {
    return null
  }

  return null
}
