import { HANDLE_PATTERN, errorResponse, fetchYouTube, getChannelIdFromPage, json, withCache } from '../_lib/youtube'

// GET /api/resolve?handle=@name
// -> { handle, channelId }
export const onRequestGet = ({ request }: { request: Request }): Promise<Response> =>
  withCache(request, async () => {
    const handle = new URL(request.url).searchParams.get('handle') ?? ''

    if (!HANDLE_PATTERN.test(handle)) return json({ error: 'Invalid channel handle' }, 400)

    try {
      const html = await fetchYouTube(`https://www.youtube.com/${handle}`)
      const channelId = getChannelIdFromPage(html)

      if (!channelId) return json({ error: 'Channel not found' }, 404)

      // A handle rarely changes owner, so this can be cached for an hour.
      return json({ handle, channelId }, 200, 3600)
    } catch (error) {
      return errorResponse(error)
    }
  })
