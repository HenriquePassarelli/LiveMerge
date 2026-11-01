type VideoStatusResponse = {
  videoId: string
  isLive: boolean
}

// Served by functions/api/video.ts (Cloudflare Pages Function). No YouTube API key or login needed.
export const getVideoLiveStatus = async (videoId: string): Promise<boolean | undefined> => {
  try {
    const response = await fetch(`/api/video?id=${encodeURIComponent(videoId)}`, { cache: 'no-store' })
    if (!response.ok) return undefined

    const result = (await response.json()) as VideoStatusResponse
    return result.isLive
  } catch (error) {
    console.error('Error fetching video live status:', error)
    return undefined
  }
}
