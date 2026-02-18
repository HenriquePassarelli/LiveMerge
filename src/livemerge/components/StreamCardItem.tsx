import { memo, useMemo, useRef, useState } from 'react'
import { Button, Group, TextInput, Title, Tooltip } from '@mantine/core'
import { IconFocusCentered, IconEdit, IconTrash } from '@tabler/icons-react'

import { StreamCardWrap, VideoFrame } from '../styles'
import type { Stream } from '../types'
import useIsLive from '../hooks/useIsLive'

type StreamCardItemProps = {
  stream: Stream
  isFocused: boolean
  onRemove: (streamId: string) => void
  onUpdateUrl: (streamId: string, nextUrl: string) => void
  onToggleFocus: (streamId: string) => void
}

const StreamCardItem = ({ stream, isFocused, onRemove, onUpdateUrl, onToggleFocus }: StreamCardItemProps) => {
  const playerRef = useRef<HTMLIFrameElement>(null)

  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [draftUrl, setDraftUrl] = useState(stream.originalUrl || stream.embedUrl)
  const [isMuted, setIsMuted] = useState(true)

  useIsLive(playerRef)

  const playerUrl = useMemo(() => {
    try {
      const url = new URL(stream.embedUrl)
      url.searchParams.set('autoplay', '1')
      url.searchParams.set('mute', '1')
      url.searchParams.set('controls', '1')
      url.searchParams.set('modestbranding', '1')
      url.searchParams.set('rel', '0')
      url.searchParams.set('enablejsapi', '1')
      url.searchParams.set('autohide', '0')
      // url.searchParams.set('origin', window.location.origin)
      url.searchParams.set('disablekb', '1')

      return url.toString()
    } catch {
      return stream.embedUrl
    }
  }, [stream.embedUrl])

  const sendPlayerCommand = (func: string) => {
    const frameWindow = playerRef.current?.contentWindow
    if (!frameWindow) return

    frameWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
  }

  const handleSaveUrl = () => {
    onUpdateUrl(stream.id, draftUrl)
    setIsEditingUrl(false)
  }

  const handleCancelEdit = () => {
    setDraftUrl(stream.originalUrl || stream.embedUrl)
    setIsEditingUrl(false)
  }

  const handleStartEdit = () => {
    setDraftUrl(stream.originalUrl || stream.embedUrl)
    setIsEditingUrl(true)
  }

  const handleToggleMute = () => {
    if (isMuted) {
      sendPlayerCommand('unMute')
      setIsMuted(false)
      return
    }

    sendPlayerCommand('mute')
    setIsMuted(true)
  }

  return (
    <StreamCardWrap isFocused={isFocused}>
      <Group justify="space-between" align="flex-start">
        <Title order={4} style={{ lineHeight: 1.2 }}>
          {stream.title}
        </Title>
        <Group gap="xs">
          <Tooltip label={isFocused ? 'Unfocus stream' : 'Focus stream'} position="top" withArrow>
            <IconFocusCentered className="cursor-p" size={20} onClick={() => onToggleFocus(stream.id)} />
          </Tooltip>

          {isEditingUrl ? (
            <>
              <Button size="compact-xs" variant="light" onClick={handleSaveUrl}>
                Save URL
              </Button>
              <Button size="compact-xs" variant="default" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Tooltip label="Edit stream URL" position="top" withArrow>
              <IconEdit className="cursor-p" size={20} onClick={handleStartEdit} />
            </Tooltip>
          )}

          <Tooltip label="Remove stream" position="top" withArrow>
            <IconTrash className="cursor-p" size={20} onClick={() => onRemove(stream.id)} />
          </Tooltip>
        </Group>
      </Group>

      {isEditingUrl && (
        <TextInput
          label="Stream URL"
          placeholder="https://www.youtube.com/watch?v=..."
          value={draftUrl}
          onChange={(event) => setDraftUrl(event.currentTarget.value)}
        />
      )}

      <VideoFrame $isFocused={isFocused}>
        <iframe
          ref={playerRef}
          src={playerUrl}
          title={stream.title}
          allowFullScreen={false}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </VideoFrame>

      {/* <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={handleToggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button size="xs" variant="light" onClick={() => onToggleFocus(stream.id)}>
            {isFocused ? 'Unfocus' : 'Focus'}
          </Button>
        </Group> 
        */}

      {/* {stream.chatUrl ? (
          <Button
            size="xs"
            variant="subtle"
            component="a"
            href={stream.chatUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Chat
          </Button>
        ) : (
          <Text size="xs" c="dimmed">
            No chat URL
          </Text>
        )} */}
      {/* </Group> */}
    </StreamCardWrap>
  )
}

export default memo(StreamCardItem)
