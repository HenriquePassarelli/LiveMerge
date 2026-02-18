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
import { normalizeStreamInput } from './livemerge/utils'
import useKey from './livemerge/hooks/useKey'

function App() {
  const { streams, addStream, removeStream, updateStream } = useStateManager()

  const [preferences, setPreferences] = useStorage<UserPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)
  const [joinedStreamIds, setJoinedStreamIds] = useStorage<string[]>(STORAGE_KEYS.joinedStreams, [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalSession, setModalSession] = useState(0)
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null)

  const joinedCount = useMemo(() => joinedStreamIds.length, [joinedStreamIds])
  const activeUser = preferences.displayName.trim() || 'Guest Viewer'
  const category = preferences.favoriteCategory.trim() || 'General'

  useKey('Escape', () => {
    setFocusedStreamId(null)
  })

  const handleAddStream = (input: StreamInput) => {
    const title = input.title?.trim() || ''

    const normalizedUrls = normalizeStreamInput(input)

    if (!title || !normalizedUrls.embedUrl) {
      return
    }

    const newStream: Stream = {
      ...normalizedUrls,
      id: crypto.randomUUID(),
      title
    }

    addStream(newStream)

    if (preferences.autoJoin) {
      setJoinedStreamIds((current) => [...new Set([...current, newStream.id])])
    }

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
    setJoinedStreamIds((current) => current.filter((id) => id !== streamId))
    setFocusedStreamId((current) => (current === streamId ? null : current))
  }

  const handleUpdateStreamUrl = (streamId: string, nextUrl: string) => {
    const sourceUrl = nextUrl.trim()
    if (!sourceUrl) return

    const normalizedEmbedUrl = normalizeStreamInput(sourceUrl)
    if (!normalizedEmbedUrl) return

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
              onRemove={handleRemoveStream}
              onUpdateUrl={handleUpdateStreamUrl}
              onToggleFocus={handleToggleFocus}
            />
          ))}
        </SimpleGrid>

        <FloatingActionWrap>
          <ActionIcon
            size={58}
            radius="xl"
            variant="filled"
            color="cyan"
            aria-label="Open setup modal"
            onClick={openModal}
            style={{ boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5)' }}
          >
            +
          </ActionIcon>
        </FloatingActionWrap>

        <ManageModal
          key={modalSession}
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialPreferences={preferences}
          onSubmitStream={handleAddStream}
          onSubmitUser={handleSaveUserSetup}
        />
      </Shell>
    </MantineProvider>
  )
}

export default App
