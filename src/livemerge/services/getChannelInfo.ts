type YouTubeChannelResponse = {
  items?: Array<{
    snippet: {
      title: string
      description: string
      thumbnails: {
        default?: { url: string }
        medium?: { url: string }
        high?: { url: string }
      }
    }
  }>
}
const GOOGLE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels'

export const getChannelInfo = async (channelId: string, token: string): Promise<string | null> => {
  try {
    const params = new URLSearchParams({
      id: channelId,
      part: 'snippet'
    })

    const response = await fetch(`${GOOGLE_CHANNELS_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const result = (await response.json()) as YouTubeChannelResponse

    const channelInfo = result.items?.[0]
    return channelInfo?.snippet.title || null
  } catch (error) {
    console.error('Error fetching channel info for channel ID:', channelId, error)
    return null
  }
}
