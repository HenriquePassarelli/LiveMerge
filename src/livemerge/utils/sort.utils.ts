import type { SortMode, Stream } from '../types/types'
import { getYouTubeVideoId } from './youtube.utils.ts'

const sortByTitleAsc = (streams: Stream[]) => {
  return [...streams].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
}

const sortByTitleDesc = (streams: Stream[]) => {
  return [...streams].sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''))
}

export const sortByCustomOrder = (streams: Stream[], customOrder: string[]) => {
  const streamMap = new Map(streams.map((stream) => [stream.id, stream]))
  const orderedIds = new Set(customOrder)
  const orderedStreams = customOrder
    .map((id) => streamMap.get(id))
    .filter((stream): stream is Stream => Boolean(stream))
  const remainingStreams = streams.filter((stream) => !orderedIds.has(stream.id))

  return [...orderedStreams, ...remainingStreams]
}

// A stream is "known not live" when we have an answer and it is no:
// - channels report it through isLive;
// - manual YouTube streams report it through shouldAutoplay, which is the saved result of the live check
//   (undefined means the check has not answered yet, and links we cannot check, such as other sites, stay put).
const isKnownNotLive = (stream: Stream): boolean => {
  if (stream.isLive === false) return true
  if (stream.channelId) return false

  return stream.shouldAutoplay === false && getYouTubeVideoId(stream.originalUrl || stream.embedUrl) !== null
}

// Streams known to be not live sink below everything else, whatever the sort order.
// Nothing is saved: the saved order is untouched, so a channel returns to its own position as soon as
// polling finds it live again.
export const moveOfflineToEnd = (streams: Stream[]): Stream[] => [
  ...streams.filter((stream) => !isKnownNotLive(stream)),
  ...streams.filter((stream) => isKnownNotLive(stream))
]

export const getSortedStreams = (streams: Stream[], sortMode: SortMode, customSortOrder: string[]): Stream[] => {
  if (sortMode === 'title-desc') {
    return moveOfflineToEnd(sortByTitleDesc(streams))
  } else if (sortMode === 'custom') {
    return moveOfflineToEnd(sortByCustomOrder(streams, customSortOrder))
  }
  return moveOfflineToEnd(sortByTitleAsc(streams))
}
