import type { SortMode, Stream } from '../types'

const sortByTitle = (streams: Stream[]) => {
  return [...streams].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
}

export const sortByCustomOrder = (streams: Stream[], customOrder: string[]) => {
  const orderMap = new Map(customOrder.map((id, index) => [id, index]))

  return [...streams].sort((a, b) => {
    const indexA = orderMap.get(a.id) ?? Number.POSITIVE_INFINITY
    const indexB = orderMap.get(b.id) ?? Number.POSITIVE_INFINITY
    return indexA - indexB
  })
}

export const getSortedStreams = (streams: Stream[], sortMode: SortMode, customSortOrder: string[]): Stream[] => {
  if (sortMode === 'title-asc') {
    return sortByTitle(streams)
  } else if (sortMode === 'default') {
    return sortByCustomOrder(streams, customSortOrder)
  }
  return streams
}
