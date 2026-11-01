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
      if (parsed.pathname === '/watch' || parsed.pathname === '/live_chat' || parsed.pathname === '/live_chat_replay') {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('?')[0] || null
      }

      if (parsed.pathname.startsWith('/live/')) {
        return parsed.pathname.split('/live/')[1]?.split('?')[0] || null
      }
    }
  } catch {
    return null
  }

  return null
}

export const normalizeYoutubeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  const videoId = getYouTubeVideoId(trimmed)
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`

  return trimmed
}

export const buildPlayableUrl = (embedUrl: string, shouldAutoplay = false): string => {
  try {
    const url = new URL(embedUrl)
    url.searchParams.set('autoplay', shouldAutoplay ? '1' : '0')
    url.searchParams.set('mute', '1')
    url.searchParams.set('controls', '1')
    url.searchParams.set('modestbranding', '1')
    url.searchParams.set('rel', '0')
    url.searchParams.set('enablejsapi', '1')
    url.searchParams.set('autohide', '0')
    url.searchParams.set('origin', window.location.origin)
    url.searchParams.set('disablekb', '1')

    return url.toString()
  } catch {
    return embedUrl
  }
}

export const buildLiveChatUrl = (url: string, theme: 'dark' | 'light' = 'dark'): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  const videoId = getYouTubeVideoId(trimmed)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''

  if (videoId) {
    const isReplay = trimmed.includes('live_chat_replay')
    const path = isReplay ? 'live_chat_replay' : 'live_chat'
    const domainQuery = hostname ? `&embed_domain=${encodeURIComponent(hostname)}` : ''
    return `https://www.youtube.com/${path}?v=${videoId}${domainQuery}&theme=${theme}`
  }

  try {
    const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
    const parsed = new URL(fullUrl)
    if (hostname && !parsed.searchParams.get('embed_domain')) {
      parsed.searchParams.set('embed_domain', hostname)
    }
    parsed.searchParams.set('theme', theme)
    return parsed.toString()
  } catch {
    return trimmed
  }
}
