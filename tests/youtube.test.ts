import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CHANNEL_ID_PATTERN,
  HANDLE_PATTERN,
  getCanonicalVideoId,
  getChannelIdFromPage,
  getChannelNameFromPage,
  getVideoIdFromPage,
  isLiveNow
} from '../functions/_lib/youtube.ts'

// Small fixtures that mirror the markers the parser relies on in real YouTube pages.
// If YouTube changes its markup and detection breaks, save the new real page's markers here first.

const CHANNEL_ID = 'UC13ikrGSy3E2AveqLAI9lqg'
const VIDEO_ID = 'xUDeHSPgf5w'

const livePage = String.raw`<html><head>
<link rel="canonical" href="https://www.youtube.com/watch?v=${VIDEO_ID}">
<title>Some Show #1 - YouTube</title></head><body><script>
var ytInitialPlayerResponse = 
{"playabilityStatus":{"status":"OK","playableInEmbed":true,"liveStreamability":{"liveStreamabilityRenderer":
{"videoId":"${VIDEO_ID}","broadcastId":"1","pollDelayMs":"15000"}},"miniplayer":{}},"streamingData":{},"videoDetails":
{"videoId":"${VIDEO_ID}","title":"Some Show #1","isLiveContent":true,"isLive":true,"author":"Some Channel"}};
</script></body></html>`

const endedStreamPage = String.raw`<html><head>
<link rel="canonical" href="https://www.youtube.com/watch?v=${VIDEO_ID}">
<title>Some Show #1 - YouTube</title></head><body><script>
var ytInitialPlayerResponse = {"playabilityStatus":{"status":"OK","playableInEmbed":true,"miniplayer":{}},
"streamingData":{},"videoDetails":{"videoId":"${VIDEO_ID}","title":
"Some Show #1","isLiveContent":true,"author":"Some Channel"},
"microformat":{"playerMicroformatRenderer":{"liveBroadcastDetails":
{"isLiveNow":false,"endTimestamp":"2026-11-01T01:00:00+00:00"}}}};
</script></body></html>`

const upcomingStreamPage = String.raw`<html><head>
<link rel="canonical" href="https://www.youtube.com/watch?v=${VIDEO_ID}"></head><body><script>
var ytInitialPlayerResponse = {"playabilityStatus":
{"status":"LIVE_STREAM_OFFLINE","liveStreamability":
{"liveStreamabilityRenderer":{"videoId":"${VIDEO_ID}","offlineSlate":{}}}},
"videoDetails":{"videoId":"${VIDEO_ID}","isLiveContent":true,"isUpcoming":true,"author":"Some Channel"}};
</script></body></html>`

const offlineChannelPage = String.raw`<html><head>
<link rel="canonical" href="https://www.youtube.com/channel/${CHANNEL_ID}">
<title>Some Channel - YouTube</title></head><body><script>
var ytInitialData = {"metadata":
{"channelMetadataRenderer":{"title":"Caf\u00e9 \u0026 Co","externalId":"${CHANNEL_ID}"}}};
</script></body></html>`

describe('isLiveNow', () => {
  it('detects a stream that is broadcasting', () => {
    assert.equal(isLiveNow(livePage), true)
  })

  it('does not treat an ended stream as live', () => {
    assert.equal(isLiveNow(endedStreamPage), false)
  })

  it('does not treat an upcoming stream as live', () => {
    assert.equal(isLiveNow(upcomingStreamPage), false)
  })

  it('does not treat an offline channel page as live', () => {
    assert.equal(isLiveNow(offlineChannelPage), false)
  })

  it('still detects live through the microformat flag', () => {
    assert.equal(isLiveNow('{"liveBroadcastDetails":{"isLiveNow":true}}'), true)
  })
})

describe('getCanonicalVideoId', () => {
  it('returns the video ID of a watch page', () => {
    assert.equal(getCanonicalVideoId(livePage), VIDEO_ID)
  })

  it('returns null for a channel page', () => {
    assert.equal(getCanonicalVideoId(offlineChannelPage), null)
  })
})

describe('getVideoIdFromPage', () => {
  it('prefers the canonical link', () => {
    assert.equal(getVideoIdFromPage(livePage), VIDEO_ID)
  })

  it('falls back to the player data when the canonical link is missing', () => {
    const withoutCanonical = livePage.replace(/<link rel="canonical"[^>]*>/, '')

    assert.equal(getCanonicalVideoId(withoutCanonical), null)
    assert.equal(getVideoIdFromPage(withoutCanonical), VIDEO_ID)
  })

  it('returns null for an offline channel page', () => {
    assert.equal(getVideoIdFromPage(offlineChannelPage), null)
  })
})

describe('getChannelNameFromPage', () => {
  it('reads the author from a live watch page', () => {
    assert.equal(getChannelNameFromPage(livePage), 'Some Channel')
  })

  it('reads and unescapes the channel metadata title', () => {
    assert.equal(getChannelNameFromPage(offlineChannelPage), 'Café & Co')
  })

  it('returns null when the page has no name', () => {
    assert.equal(getChannelNameFromPage('<html></html>'), null)
  })
})

describe('getChannelIdFromPage', () => {
  it('reads the ID from the canonical channel link', () => {
    assert.equal(getChannelIdFromPage(offlineChannelPage), CHANNEL_ID)
  })

  it('falls back to externalId', () => {
    assert.equal(getChannelIdFromPage(`{"externalId":"${CHANNEL_ID}"}`), CHANNEL_ID)
  })

  it('returns null when no ID is present', () => {
    assert.equal(getChannelIdFromPage(livePage), null)
  })
})

describe('input patterns', () => {
  it('accepts channel IDs and rejects malformed ones', () => {
    assert.equal(CHANNEL_ID_PATTERN.test(CHANNEL_ID), true)
    assert.equal(CHANNEL_ID_PATTERN.test('UC123'), false)
    assert.equal(CHANNEL_ID_PATTERN.test(`${CHANNEL_ID}x`), false)
  })

  it('accepts handles and rejects malformed ones', () => {
    assert.equal(HANDLE_PATTERN.test('@richardrasmussen'), true)
    assert.equal(HANDLE_PATTERN.test('richardrasmussen'), false)
    assert.equal(HANDLE_PATTERN.test('@a'), false)
  })
})
