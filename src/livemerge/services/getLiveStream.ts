import type { YouTubeSearchResponse } from '../types/youtube'

const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

export const getLiveStream = async (channelId: string, token: string): Promise<YouTubeSearchResponse | null> => {
  const params = new URLSearchParams({
    eventType: 'live',
    part: 'snippet',
    type: 'video',
    order: 'date',
    channelId
  })

  try {
    const response = await fetch(`${GOOGLE_SEARCH_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const result = (await response.json()) as YouTubeSearchResponse
    return result
  } catch (error) {
    console.error('Error fetching stream for channel ID:', channelId, error)
    return null
  }
}
