import { VIDEO_ID_PATTERN, errorResponse, fetchYouTube, isLiveNow, json, withCache } from '../_lib/youtube'

// GET /api/video?id=VIDEO_ID
// -> { videoId, isLive }
export const onRequestGet = ({ request }: { request: Request }): Promise<Response> =>
  withCache(request, async () => {
    const videoId = new URL(request.url).searchParams.get('id') ?? ''

    if (!VIDEO_ID_PATTERN.test(videoId)) return json({ error: 'Invalid video id' }, 400)

    try {
      const html = await fetchYouTube(`https://www.youtube.com/watch?v=${videoId}`)

      return json({ videoId, isLive: isLiveNow(html) }, 200, 30)
    } catch (error) {
      return errorResponse(error)
    }
  })
