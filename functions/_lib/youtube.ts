// Shared helpers for the Cloudflare Pages Functions that check YouTube live status
// without the YouTube Data API. They read public YouTube pages server-side, because
// browsers cannot fetch them directly (no CORS headers).

export const CHANNEL_ID_PATTERN = /^UC[\w-]{22}$/
export const HANDLE_PATTERN = /^@[\w.-]{3,30}$/
export const VIDEO_ID_PATTERN = /^[\w-]{11}$/

const YOUTUBE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  // Skips the EU consent interstitial that datacenter IPs sometimes receive.
  Cookie: 'CONSENT=YES+1; SOCS=CAI'
}

export class UpstreamError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const fetchYouTube = async (url: string): Promise<string> => {
  const response = await fetch(url, { headers: YOUTUBE_HEADERS, redirect: 'follow' })

  if (!response.ok) throw new UpstreamError(`YouTube responded with ${response.status}`, response.status)
  if (response.url.includes('consent.youtube.com')) throw new UpstreamError('YouTube asked for consent', 502)

  return response.text()
}

export const json = (body: unknown, status = 200, maxAgeSeconds = 0): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': maxAgeSeconds > 0 ? `public, max-age=${maxAgeSeconds}` : 'no-store'
    }
  })

export const errorResponse = (error: unknown): Response => {
  const status = error instanceof UpstreamError && error.status === 404 ? 404 : 502
  return json({ error: error instanceof Error ? error.message : 'Unknown error' }, status)
}

// Shares one upstream request between every visitor while the cached response is fresh.
export const withCache = async (request: Request, produce: () => Promise<Response>): Promise<Response> => {
  // `caches` only exists on Cloudflare; the Vite dev server runs in Node without it.
  if (typeof caches === 'undefined') return produce()

  const cache = (caches as unknown as { default: Cache }).default
  const key = new Request(request.url, { method: 'GET' })

  const cached = await cache.match(key)
  if (cached) return cached

  const response = await produce()
  if (response.ok) await cache.put(key, response.clone())

  return response
}

// videoDetails carries "isLive":true only while a video is broadcasting (past streams have isLiveContent instead).
const getVideoDetailsBlock = (html: string): string => {
  const index = html.indexOf('"videoDetails":{')
  return index === -1 ? '' : html.slice(index, index + 30000)
}

const getPlayabilityBlock = (html: string): string => {
  const index = html.indexOf('"playabilityStatus":{')
  return index === -1 ? '' : html.slice(index, index + 2000)
}

// A broadcasting stream is playable (status OK) and carries liveStreamability; upcoming streams report
// LIVE_STREAM_OFFLINE and ended ones drop liveStreamability.
const isPlayableLiveStream = (html: string): boolean => {
  const block = getPlayabilityBlock(html)
  return /"status"\s*:\s*"OK"/.test(block) && block.includes('"liveStreamability"')
}

export const isLiveNow = (html: string): boolean =>
  /"isLiveNow"\s*:\s*true/.test(html) ||
  /"isLive"\s*:\s*true/.test(getVideoDetailsBlock(html)) ||
  isPlayableLiveStream(html)

export const getCanonicalVideoId = (html: string): string | null =>
  html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1] ?? null

// A channel page (for example youtube.com/@handle) names its own channel ID in several places.
export const getChannelIdFromPage = (html: string): string | null =>
  html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/)?.[1] ??
  html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ??
  html.match(/<meta itemprop="(?:identifier|channelId)" content="(UC[\w-]{22})"/)?.[1] ??
  null

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, '&')

// The first <title> in a channel's RSS feed is the channel name.
export const getChannelName = async (channelId: string): Promise<string | null> => {
  const xml = await fetchYouTube(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
  const title = xml.match(/<title>([^<]*)<\/title>/)?.[1]?.trim()

  return title ? decodeXmlEntities(title) : null
}

// Fallback when the RSS feed is unavailable: read the name from the /live page that was already fetched.
const parseJsonString = (raw: string): string => {
  try {
    return JSON.parse(`"${raw}"`) as string
  } catch {
    return raw
  }
}

const getMetaContent = (html: string, property: string): string | null => {
  const tag = html.match(new RegExp(`<meta\\s[^>]*(?:property|name)="${property}"[^>]*>`))?.[0]
  const content = tag?.match(/content="([^"]*)"/)?.[1]

  return content ? decodeXmlEntities(content) : null
}

export const getChannelNameFromPage = (html: string): string | null => {
  // Channel page data (offline channels) and live watch page data (live channels).
  const metadata = html.match(/"channelMetadataRenderer":\{"title":"((?:[^"\\]|\\.)*)"/)?.[1]
  if (metadata) return parseJsonString(metadata)

  const owner = html.match(/"ownerChannelName":"((?:[^"\\]|\\.)*)"/)?.[1]
  if (owner) return parseJsonString(owner)

  const author = html.match(/"author":"((?:[^"\\]|\\.)*)"/)?.[1]
  if (author) return parseJsonString(author)

  const itemprop = html.match(/<link\s[^>]*itemprop="name"[^>]*content="([^"]*)"/)?.[1]
  if (itemprop) return decodeXmlEntities(itemprop)

  // On a channel page (no video canonical link) og:title / <title> are the channel name.
  if (getCanonicalVideoId(html) === null) {
    const ogTitle = getMetaContent(html, 'og:title')
    if (ogTitle) return ogTitle

    const pageTitle = html
      .match(/<title>([^<]*)<\/title>/)?.[1]
      ?.replace(/\s*-\s*YouTube\s*$/, '')
      .trim()
    if (pageTitle) return decodeXmlEntities(pageTitle)
  }

  return null
}
