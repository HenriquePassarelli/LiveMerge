import { useEffect, useMemo, useState } from 'react'
import { MantineProvider, SimpleGrid } from '@mantine/core'
import '@mantine/core/styles.css'

import { DEFAULT_PREFERENCES, STORAGE_KEYS } from './livemerge/constants'
import Header from './livemerge/components/Header'
import ManageModal from './livemerge/components/ManageModal'
import SortModal from './livemerge/components/SortModal'
import StreamCardItem from './livemerge/components/StreamCardItem'
import { useStateManager } from './livemerge/hooks/useStateManager'
import { useStorage } from './livemerge/hooks/useStorage'
import { Shell } from './livemerge/styles'
import type { SortMode, Stream, StreamInput, UserPreferences } from './livemerge/types'
import { normalizeStreamInput } from './livemerge/utils/utils'
import useKey from './livemerge/hooks/useKey'
import LiveChat from './livemerge/components/LiveChat'
import { getSortedStreams } from './livemerge/utils/sort.utils'
import ActionMenu from './livemerge/components/ActionMenu'

function App() {
  const { streams, addStream, removeStream, updateStream } = useStateManager()

  const [modalSession, setModalSession] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [chatUrl, setChatUrl] = useState<string | null>(null)
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [preferences, setPreferences] = useStorage<UserPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)
  const [customSortOrder, setCustomSortOrder] = useStorage<string[]>(STORAGE_KEYS.customSortOrder, [])

  useEffect(() => {
    window.document.title = 'LiveMerge - Watch multiple live streams together'
  }, [])

  useKey('Escape', () => {
    setFocusedStreamId(null)
  })

  useEffect(() => {
    setCustomSortOrder((current) => {
      const streamIds = streams.map((stream) => stream.id)
      const validCurrent = current.filter((id) => streamIds.includes(id))
      const missingIds = streamIds.filter((id) => !validCurrent.includes(id))
      const next = [...validCurrent, ...missingIds]

      const isSame = next.length === current.length && next.every((id, index) => id === current[index])
      return isSame ? current : next
    })
  }, [setCustomSortOrder, streams])

  const handleAddStream = (input: StreamInput) => {
    const title = input.title?.trim() || ''

    const normalizedUrls = normalizeStreamInput(input)

    if (!title || !normalizedUrls.embedUrl) {
      alert('Please provide both a title and a valid URL for the stream.')
      return
    }

    const newStream: Stream = {
      ...normalizedUrls,
      id: crypto.randomUUID(),
      title
    }

    addStream(newStream)

    setIsModalOpen(false)
  }

  const handleSaveUserSetup = (nextPreferences: UserPreferences) => {
    setPreferences({
      displayName: nextPreferences.displayName.trim(),
      favoriteCategory: nextPreferences.favoriteCategory.trim(),
      autoJoin: nextPreferences.autoJoin
    })
    setIsModalOpen(false)
  }

  const handleRemoveStream = (streamId: string) => {
    removeStream(streamId)
    setFocusedStreamId((current) => (current === streamId ? null : current))
  }

  const handleUpdateStreamUrl = (streamId: string, nextUrl: string) => {
    const sourceUrl = nextUrl.trim()
    if (!sourceUrl) return

    const normalizedEmbedUrl = normalizeStreamInput(sourceUrl)

    if (!normalizedEmbedUrl || !normalizedEmbedUrl.embedUrl) {
      alert('Please provide a valid URL for the stream.')
      return
    }

    updateStream(streamId, {
      ...normalizedEmbedUrl
    })
  }

  const openModal = () => {
    setModalSession((current) => current + 1)
    setIsModalOpen(true)
  }

  const handleSetSortMode = (mode: SortMode) => {
    setSortMode(mode)
  }

  const handleOpenSortModal = () => {
    setIsSortModalOpen(true)
  }

  const handleApplyCustomSort = (nextOrder: string[]) => {
    setCustomSortOrder(nextOrder)
    setSortMode('custom')
    setIsSortModalOpen(false)
  }

  const handleToggleFocus = (streamId: string) => {
    setFocusedStreamId((current) => (current === streamId ? null : streamId))
  }

  const handleOpenChat = (stream: Stream) => {
    setChatUrl((prev) => (prev?.includes(stream.chatUrl) ? null : stream.chatUrl))
  }

  const orderedStreams = useMemo(() => {
    let sortableStreams = [...streams]

    sortableStreams = getSortedStreams(sortableStreams, sortMode, customSortOrder)

    if (!focusedStreamId) return sortableStreams

    const focused = sortableStreams.find((stream) => stream.id === focusedStreamId)
    if (!focused) return sortableStreams

    return [focused, ...sortableStreams.filter((stream) => stream.id !== focusedStreamId)]
  }, [customSortOrder, focusedStreamId, sortMode, streams])

  return (
    <MantineProvider
      forceColorScheme="dark"
      theme={{
        primaryColor: 'cyan',
        defaultRadius: 'md',
        fontFamily: "'IBM Plex Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      <Shell>
        <Header streamCount={streams.length} />

        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="xs">
          {orderedStreams.map((stream) => (
            <StreamCardItem
              key={stream.id}
              stream={stream}
              isFocused={stream.id === focusedStreamId}
              onOpenChat={handleOpenChat}
              onRemove={handleRemoveStream}
              onToggleFocus={handleToggleFocus}
              onUpdateUrl={handleUpdateStreamUrl}
            />
          ))}
        </SimpleGrid>

        <LiveChat chatUrl={chatUrl} onClose={() => setChatUrl(null)} />

        <ActionMenu
          sortMode={sortMode}
          openModal={openModal}
          handleSetSortMode={handleSetSortMode}
          handleOpenSortModal={handleOpenSortModal}
        />

        <ManageModal
          key={modalSession}
          opened={isModalOpen}
          initialPreferences={preferences}
          onSubmitStream={handleAddStream}
          onSubmitUser={handleSaveUserSetup}
          onClose={() => setIsModalOpen(false)}
        />

        <SortModal
          opened={isSortModalOpen}
          streams={streams}
          initialOrder={customSortOrder}
          onClose={() => setIsSortModalOpen(false)}
          onApply={handleApplyCustomSort}
        />
      </Shell>
    </MantineProvider>
  )
}

export default App
