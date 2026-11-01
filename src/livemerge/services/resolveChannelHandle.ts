type ResolveResponse = {
  handle: string
  channelId: string
}

// Served by functions/api/resolve.ts: turns an @handle into its UC… channel ID.
export const resolveChannelHandle = async (handle: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/resolve?handle=${encodeURIComponent(handle)}`, { cache: 'no-store' })

    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      console.error(`/api/resolve failed for ${handle}: HTTP ${response.status}`)
      return null
    }

    return ((await response.json()) as ResolveResponse).channelId
  } catch (error) {
    console.error('Error resolving channel handle:', handle, error)
    return null
  }
}
