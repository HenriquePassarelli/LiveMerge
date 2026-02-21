import type { SortMode, Stream } from '../types/types'

const sortByTitleAsc = (streams: Stream[]) => {
  return [...streams].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
}

const sortByTitleDesc = (streams: Stream[]) => {
  return [...streams].sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''))
}

// TODO: fix custom sort
export const sortByCustomOrder = (streams: Stream[], customOrder: string[]) => {
  const streamMap = new Map(streams.map((stream) => [stream.id, stream]))

  return customOrder.map((id) => streamMap.get(id)).filter((stream): stream is Stream => Boolean(stream))
}

export const getSortedStreams = (streams: Stream[], sortMode: SortMode, customSortOrder: string[]): Stream[] => {
  if (sortMode === 'title-desc') {
    return sortByTitleDesc(streams)
  } else if (sortMode === 'custom') {
    return sortByCustomOrder(streams, customSortOrder)
  }
  return sortByTitleAsc(streams)
}
