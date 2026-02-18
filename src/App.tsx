import { useMemo, useState } from 'react'
import { ActionIcon, MantineProvider, SimpleGrid } from '@mantine/core'
import '@mantine/core/styles.css'

import { DEFAULT_PREFERENCES, STORAGE_KEYS } from './livemerge/constants'
import HeroPanel from './livemerge/components/HeroPanel'
import ManageModal from './livemerge/components/ManageModal'
import StreamCardItem from './livemerge/components/StreamCardItem'
import { useStateManager } from './livemerge/hooks/useStateManager'
import { useStorage } from './livemerge/hooks/useStorage'
import { FloatingActionWrap, Shell } from './livemerge/styles'
import type { Stream, StreamInput, UserPreferences } from './livemerge/types'
import { normalizeStreamInput } from './livemerge/utils/utils'
import useKey from './livemerge/hooks/useKey'
import LiveChat from './livemerge/components/LiveChat'

function App() {
  const { streams, addStream, removeStream, updateStream } = useStateManager()

  const [modalSession, setModalSession] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chatUrl, setChatUrl] = useState<string | null>(null)
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null)
  const [preferences, setPreferences] = useStorage<UserPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)

  useKey('Escape', () => {
    setFocusedStreamId(null)
  })

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

  const handleToggleFocus = (streamId: string) => {
    setFocusedStreamId((current) => (current === streamId ? null : streamId))
  }

  const handleOpenChat = (stream: Stream) => {
    setChatUrl((prev) => (prev?.includes(stream.chatUrl) ? null : stream.chatUrl))
  }

  const orderedStreams = useMemo(() => {
    if (!focusedStreamId) return streams

    const focused = streams.find((stream) => stream.id === focusedStreamId)
    if (!focused) return streams

    return [focused, ...streams.filter((stream) => stream.id !== focusedStreamId)]
  }, [focusedStreamId, streams])

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
        <HeroPanel streamCount={streams.length} />

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

        <FloatingActionWrap>
          <ActionIcon
            size={58}
            radius="xl"
            color="cyan"
            variant="filled"
            onClick={openModal}
            aria-label="Open setup modal"
            style={{ boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5)' }}
          >
            +
          </ActionIcon>
        </FloatingActionWrap>

        <ManageModal
          key={modalSession}
          opened={isModalOpen}
          initialPreferences={preferences}
          onSubmitStream={handleAddStream}
          onSubmitUser={handleSaveUserSetup}
          onClose={() => setIsModalOpen(false)}
        />
      </Shell>
    </MantineProvider>
  )
}

export default App
