export type ChannelStatus = {
  channelId: string
  title: string | null
  isLive: boolean
  videoId: string | null
  nameError?: string
}

// Served by functions/api/channel.ts (Cloudflare Pages Function). No YouTube API key or login needed.
export const getChannelStatus = async (channelId: string): Promise<ChannelStatus | null> => {
  try {
    // no-store: the server caches answers for 60s, and the browser must not add a second cache on top
    // (it would make the reload button return the previous "offline" answer).
    const response = await fetch(`/api/channel?id=${encodeURIComponent(channelId)}`, { cache: 'no-store' })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      console.error(`/api/channel failed for ${channelId}: HTTP ${response.status}`)
      return null
    }

    return (await response.json()) as ChannelStatus
  } catch (error) {
    console.error('Error fetching channel status for channel ID:', channelId, error)
    return null
  }
}
