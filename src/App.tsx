import { useEffect, useMemo, useState } from 'react'
import { MantineProvider, SimpleGrid } from '@mantine/core'
import '@mantine/core/styles.css'

import { STORAGE_KEYS } from './livemerge/constants'
import Header from './livemerge/components/Header'
import ManageModal from './livemerge/components/ManageModal'
import SortModal from './livemerge/components/SortModal'
import StreamCardItem from './livemerge/components/StreamCardItem'
import { useStateManager } from './livemerge/hooks/useStateManager'
import { useStorage } from './livemerge/hooks/useStorage'
import { Shell } from './livemerge/styles'
import type { SortMode, Stream, StreamInput, UserPreferences } from './livemerge/types/types'
import { normalizeChatUrl, normalizeStreamInput } from './livemerge/utils/utils'
import { getYouTubeVideoId } from './livemerge/utils/youtube.utils'
import useKey from './livemerge/hooks/useKey'
import LiveChat from './livemerge/components/LiveChat'
import { getSortedStreams } from './livemerge/utils/sort.utils'
import ActionMenu from './livemerge/components/ActionMenu'
import useChannels from './livemerge/hooks/useChannels'
import { getVideoLiveStatus } from './livemerge/services/getVideoLiveStatus'
import { resolveChannelHandle } from './livemerge/services/resolveChannelHandle'
import { useStreamLiveStatus } from './livemerge/hooks/useStreamLiveStatus'

function App() {
  const { streams, addStream, removeStream, updateStream, ...stateManager } = useStateManager()

  const { channelStreams, channelErrors, loadChannel, reloadChannel, removeChannelStream, markChannelOffline } =
    useChannels(stateManager.channels)

  useStreamLiveStatus(streams, updateStream)

  // A manual stream that finishes broadcasting should stop autoplaying and syncing to the live edge.
  const handleStreamLiveEnded = (streamId: string) => {
    updateStream(streamId, { shouldAutoplay: false })
  }

  const [modalSession, setModalSession] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [chat, setChat] = useState<{ url: string; title: string } | null>(null)
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useStorage<SortMode>(STORAGE_KEYS.sortMode, 'default')
  const [customSortOrder, setCustomSortOrder] = useStorage<string[]>(STORAGE_KEYS.customSortOrder, [])

  useEffect(() => {
    window.document.title = 'LiveMerge - Watch multiple live streams together'
  }, [])

  useKey('Escape', () => {
    setFocusedStreamId(null)
  })

  useEffect(() => {
    setCustomSortOrder((current) => {
      // Keep saved channel IDs while their stream data is being reloaded.
      // Otherwise a refresh temporarily removes them from the custom order.
      const allStreams = [...streams, ...channelStreams]
      const streamIds = new Set([...allStreams.map((stream) => stream.id), ...stateManager.channels])
      const validCurrent = current.filter((id) => streamIds.has(id))
      const missingIds = allStreams.map((stream) => stream.id).filter((id) => !validCurrent.includes(id))
      const next = [...validCurrent, ...missingIds]

      const isSame = next.length === current.length && next.every((id, index) => id === current[index])
      return isSame ? current : next
    })
  }, [setCustomSortOrder, stateManager.channels, streams, channelStreams])

  const handleAddStream = (input: StreamInput) => {
    const title = input.title?.trim() || ''

    const normalizedUrls = normalizeStreamInput(input)

    if (!title || !normalizedUrls.embedUrl) {
      alert('Please provide both a title and a valid URL for the stream.')
      return
    }

    const videoId = getYouTubeVideoId(normalizedUrls.originalUrl)

    const addStreamWithStatus = async () => {
      const shouldAutoplay = videoId ? await getVideoLiveStatus(videoId) : false
      const newStream: Stream = {
        ...normalizedUrls,
        id: crypto.randomUUID(),
        title,
        shouldAutoplay
      }

      addStream(newStream)
    }

    void addStreamWithStatus()
    setIsModalOpen(false)
  }

  const handleSaveUserSetup = (nextPreferences: UserPreferences) => {
    stateManager.updateUserPreferences({
      displayName: nextPreferences.displayName.trim(),
      favoriteCategory: nextPreferences.favoriteCategory.trim(),
      autoJoin: nextPreferences.autoJoin
    })
    setIsModalOpen(false)
  }

  const handleAddChannel = async (channelIdOrHandle: string): Promise<boolean> => {
    let channelId = channelIdOrHandle

    if (channelIdOrHandle.startsWith('@')) {
      const resolvedChannelId = await resolveChannelHandle(channelIdOrHandle)

      if (!resolvedChannelId) {
        alert(`Could not find a channel for ${channelIdOrHandle}. Check the handle and try again.`)
        return false
      }

      channelId = resolvedChannelId
    }

    if (stateManager.channels.includes(channelId)) {
      alert('This channel has already been added.')
      return false
    }

    // Load the channel name and live status first, so only real, reachable channels are added.
    const isLoaded = await loadChannel(channelId)

    if (!isLoaded) {
      alert('Could not load this channel or its name. Check the channel ID and try again.')
      return false
    }

    stateManager.addChannel(channelId)
    setIsModalOpen(false)
    return true
  }

  const handleRemoveStream = (streamId: string) => {
    const channelStream = channelStreams.find((stream) => stream.id === streamId)

    if (channelStream?.channelId) {
      stateManager.removeChannel(channelStream.channelId)
      removeChannelStream(channelStream.channelId)
    } else {
      removeStream(streamId)
    }

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

    const videoId = getYouTubeVideoId(normalizedEmbedUrl.originalUrl)

    const updateStreamWithStatus = async () => {
      const shouldAutoplay = videoId ? await getVideoLiveStatus(videoId) : false
      updateStream(streamId, {
        ...normalizedEmbedUrl,
        shouldAutoplay
      })
    }

    void updateStreamWithStatus()
  }

  const openModal = () => {
    setModalSession((current) => current + 1)
    setIsModalOpen(true)
  }

  const handleOpenSortModal = () => {
    setIsSortModalOpen(true)
  }

  const handleApplyCustomSort = (nextOrder: string[], sortMode: SortMode) => {
    setCustomSortOrder(nextOrder)
    setSortMode(sortMode)
    setIsSortModalOpen(false)
  }

  const handleToggleFocus = (streamId: string) => {
    setFocusedStreamId((current) => (current === streamId ? null : streamId))
  }

  const handleOpenChat = (stream: Stream) => {
    const targetChatUrl = stream.chatUrl || (stream.originalUrl ? normalizeChatUrl(stream.originalUrl) : '')
    if (!targetChatUrl) return

    const targetChat = { url: targetChatUrl, title: stream.title?.trim() ?? '' }

    setChat((prev) => {
      if (!prev) return targetChat
      const prevVideoId = getYouTubeVideoId(prev.url)
      const targetVideoId = getYouTubeVideoId(targetChatUrl)
      if (prevVideoId && targetVideoId && prevVideoId === targetVideoId) {
        return null
      }
      return prev.url.includes(targetChatUrl) || targetChatUrl.includes(prev.url) ? null : targetChat
    })
  }

  // Cards are always rendered in the same DOM order (by id) and positioned with CSS `order` instead.
  // Moving an iframe in the DOM reloads it, so changing the sort must never reorder the DOM nodes.
  const { renderedStreams, visualPositions } = useMemo(() => {
    const allStreams = [...streams, ...channelStreams]
    const sortedStreams = getSortedStreams(allStreams, sortMode, customSortOrder)

    return {
      renderedStreams: [...allStreams].sort((a, b) => a.id.localeCompare(b.id)),
      visualPositions: new Map(sortedStreams.map((stream, index) => [stream.id, index]))
    }
  }, [customSortOrder, sortMode, channelStreams, streams])

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
        <Header streamCount={streams.length} channelsCount={stateManager.channels.length} />

        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="xs">
          {renderedStreams.map((stream) => (
            <StreamCardItem
              key={stream.id}
              stream={stream}
              order={visualPositions.get(stream.id)}
              hasRefreshError={Boolean(stream.channelId && channelErrors[stream.channelId])}
              isFocused={stream.id === focusedStreamId}
              onOpenChat={handleOpenChat}
              onChannelLiveEnded={markChannelOffline}
              onStreamLiveEnded={handleStreamLiveEnded}
              onRemove={handleRemoveStream}
              reloadChannel={reloadChannel}
              onToggleFocus={handleToggleFocus}
              onUpdateUrl={handleUpdateStreamUrl}
            />
          ))}
        </SimpleGrid>

        <LiveChat chatUrl={chat?.url ?? null} title={chat?.title} onClose={() => setChat(null)} />

        <ActionMenu openModal={openModal} handleOpenSortModal={handleOpenSortModal} />

        <ManageModal
          key={modalSession}
          opened={isModalOpen}
          onSubmitStream={handleAddStream}
          onSubmitChannel={handleAddChannel}
          onSubmitUser={handleSaveUserSetup}
          initialPreferences={stateManager.userPreferences}
          onClose={() => setIsModalOpen(false)}
        />

        <SortModal
          opened={isSortModalOpen}
          initialSortMode={sortMode}
          initialOrder={customSortOrder}
          streams={[...streams, ...channelStreams]}
          onClose={() => setIsSortModalOpen(false)}
          onApply={handleApplyCustomSort}
        />
      </Shell>
    </MantineProvider>
  )
}

export default App
