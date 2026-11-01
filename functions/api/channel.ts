import {
  CHANNEL_ID_PATTERN,
  errorResponse,
  fetchYouTube,
  getCanonicalVideoId,
  getChannelName,
  getChannelNameFromPage,
  isLiveNow,
  json,
  withCache
} from '../_lib/youtube'

// GET /api/channel?id=UCxxxxxxxxxxxxxxxxxxxxxx
// -> { channelId, title, isLive, videoId, nameError? }
export const onRequestGet = ({ request }: { request: Request }): Promise<Response> =>
  withCache(request, async () => {
    const channelId = new URL(request.url).searchParams.get('id') ?? ''

    if (!CHANNEL_ID_PATTERN.test(channelId)) return json({ error: 'Invalid channel id' }, 400)

    const [liveResult, nameResult] = await Promise.allSettled([
      fetchYouTube(`https://www.youtube.com/channel/${channelId}/live`),
      getChannelName(channelId)
    ])

    // Without the /live page we cannot tell live from offline, so report an error
    // instead of a wrong "offline" and let the client keep its previous state.
    if (liveResult.status === 'rejected') return errorResponse(liveResult.reason)

    const html = liveResult.value
    const videoId = getCanonicalVideoId(html)
    const isLive = isLiveNow(html) && videoId !== null

    // Prefer the RSS feed name; fall back to the name found on the /live page.
    const feedName = nameResult.status === 'fulfilled' ? nameResult.value : null
    const title = feedName ?? getChannelNameFromPage(html)

    return json(
      {
        channelId,
        title,
        isLive,
        videoId: isLive ? videoId : null,
        ...(title === null && {
          nameError: nameResult.status === 'rejected' ? String(nameResult.reason) : 'No name found in feed or page'
        })
      },
      200,
      60
    )
  })
