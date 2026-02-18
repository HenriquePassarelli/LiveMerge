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

export const normalizeYoutubeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  const videoId = getYouTubeVideoId(trimmed)
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`

  return trimmed
}
