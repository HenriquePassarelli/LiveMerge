import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getSortedStreams, moveOfflineToEnd } from '../src/livemerge/utils/sort.utils.ts'

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=xUDeHSPgf5w'

// A channel stream: isLive tells whether the channel is broadcasting.
const channel = (id: string, isLive: boolean) => ({
  id,
  title: id,
  originalUrl: '',
  embedUrl: '',
  chatUrl: '',
  channelId: id,
  isLive
})

// A manually added stream: shouldAutoplay is the saved result of the live check (undefined = no answer yet).
const manual = (id: string, shouldAutoplay?: boolean, originalUrl = YOUTUBE_URL) => ({
  id,
  title: id,
  originalUrl,
  embedUrl: '',
  chatUrl: '',
  shouldAutoplay
})

const ids = (streams: { id: string }[]) => streams.map((stream) => stream.id)

describe('moveOfflineToEnd', () => {
  it('puts offline channels last and keeps the order inside each group', () => {
    const streams = [channel('a', false), channel('b', true), channel('c', false), channel('d', true)]

    assert.deepEqual(ids(moveOfflineToEnd(streams)), ['b', 'd', 'a', 'c'])
  })

  it('moves a manual YouTube stream that is not live', () => {
    const streams = [manual('stopped', false), manual('live', true), channel('c', true)]

    assert.deepEqual(ids(moveOfflineToEnd(streams)), ['live', 'c', 'stopped'])
  })

  it('keeps a manual stream in place while its live status is unknown', () => {
    const streams = [manual('unknown'), channel('a', false), channel('b', true)]

    assert.deepEqual(ids(moveOfflineToEnd(streams)), ['unknown', 'b', 'a'])
  })

  it('keeps links that cannot be checked in place', () => {
    const streams = [manual('other-site', false, 'https://example.com/stream'), channel('a', false)]

    assert.deepEqual(ids(moveOfflineToEnd(streams)), ['other-site', 'a'])
  })
})

describe('getSortedStreams', () => {
  it('applies the custom order, then sinks offline channels', () => {
    const streams = [channel('a', true), channel('b', false), channel('c', true)]

    assert.deepEqual(ids(getSortedStreams(streams, 'custom', ['b', 'c', 'a'])), ['c', 'a', 'b'])
  })

  it('returns a channel to its own position once it is live again', () => {
    const order = ['b', 'c', 'a']
    const offline = [channel('a', true), channel('b', false), channel('c', true)]
    const live = [channel('a', true), channel('b', true), channel('c', true)]

    assert.deepEqual(ids(getSortedStreams(offline, 'custom', order)), ['c', 'a', 'b'])
    assert.deepEqual(ids(getSortedStreams(live, 'custom', order)), ['b', 'c', 'a'])
  })
})
