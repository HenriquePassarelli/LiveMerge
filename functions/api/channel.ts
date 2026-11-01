import {
  CHANNEL_ID_PATTERN,
  errorResponse,
  fetchYouTube,
  getChannelName,
  getChannelNameFromPage,
  getVideoIdFromPage,
  isLiveNow,
  json,
  withCache
} from '../_lib/youtube'

// GET /api/channel?id=UCxxxxxxxxxxxxxxxxxxxxxx
// -> { channelId, title, isLive, videoId, nameError? }
//
// Add &debug=1 to see what the /live page looked like (not cached, nothing is parsed into the app).
export const onRequestGet = ({ request }: { request: Request }): Promise<Response> =>
  withCache(request, async () => {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('id') ?? ''

    if (!CHANNEL_ID_PATTERN.test(channelId)) return json({ error: 'Invalid channel id' }, 400)

    // Without the /live page we cannot tell live from offline, so report an error
    // instead of a wrong "offline" and let the client keep its previous state.
    let html: string
    try {
      html = await fetchYouTube(`https://www.youtube.com/channel/${channelId}/live`)
    } catch (error) {
      return errorResponse(error)
    }

    const videoId = getVideoIdFromPage(html)
    const isLive = isLiveNow(html) && videoId !== null

    // The /live page already names the channel. The RSS feed is only a fallback, which keeps this
    // to one request to YouTube per check (important when many channels are checked at once).
    let title = getChannelNameFromPage(html)
    let nameError: string | undefined

    if (title === null) {
      try {
        title = await getChannelName(channelId)
      } catch (error) {
        nameError = String(error)
      }
    }

    if (searchParams.has('debug')) {
      return json({
        length: html.length,
        canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null,
        titleTag: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
        hasConsentMarker: html.includes('consent.youtube.com'),
        hasInitialData: html.includes('ytInitialData'),
        hasPlayerResponse: html.includes('ytInitialPlayerResponse'),
        isLive,
        videoId,
        title,
        nameError
      })
    }

    return json(
      {
        channelId,
        title,
        isLive,
        videoId: isLive ? videoId : null,
        ...(title === null && { nameError: nameError ?? 'No name found in the page or the feed' })
      },
      200,
      60
    )
  })
