import { memo, useMemo, useRef, useState } from 'react'
import { Button, Group, TextInput, Title, Tooltip } from '@mantine/core'
import { IconFocusCentered, IconEdit, IconTrash, IconMessage } from '@tabler/icons-react'

import type { Stream } from '../types'
import RemoveModal from './RemoveModal'
import styled, { css } from 'styled-components'

type StreamCardItemProps = {
  stream: Stream
  isFocused: boolean
  onRemove: (streamId: string) => void
  onOpenChat: (stream: Stream) => void
  onToggleFocus: (streamId: string) => void
  onUpdateUrl: (streamId: string, nextUrl: string) => void
}

const StreamCardItem = ({ stream, isFocused, ...props }: StreamCardItemProps) => {
  const playerRef = useRef<HTMLIFrameElement>(null)

  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [draftUrl, setDraftUrl] = useState(stream.originalUrl || stream.embedUrl)
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)

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
      url.searchParams.set('origin', window.location.origin)
      url.searchParams.set('disablekb', '1')

      return url.toString()
    } catch {
      return stream.embedUrl
    }
  }, [stream.embedUrl])

  const handleSaveUrl = () => {
    setIsEditingUrl(false)

    props.onUpdateUrl(stream.id, draftUrl)
  }

  const handleCancelEdit = () => {
    setDraftUrl(stream.originalUrl || stream.embedUrl)
    setIsEditingUrl(false)
  }

  const handleStartEdit = () => {
    setDraftUrl(stream.originalUrl || stream.embedUrl)
    setIsEditingUrl(true)
  }

  const handleOpenRemoveConfirm = () => {
    setIsRemoveConfirmOpen(true)
  }

  const handleCloseRemoveConfirm = () => {
    setIsRemoveConfirmOpen(false)
  }

  const handleOpenChat = () => {
    props.onOpenChat(stream)
  }

  return (
    <StreamCardWrap $isFocused={isFocused}>
      <Group justify="space-between" align="flex-start">
        <Group align="center" gap="xs">
          <Title order={4} style={{ lineHeight: 1.2 }}>
            {stream.title}
          </Title>
          {/* <Tooltip label={isMuted ? 'Unmute stream' : 'Mute stream'} position="top" withArrow>
            {isMuted ? (
              <IconVolumeOff className="cursor-p" size={20} onClick={toggleMute} />
            ) : (
              <IconVolume className="cursor-p" size={20} onClick={toggleMute} />
            )}
          </Tooltip> */}
        </Group>
        <Group gap="xs">
          <Tooltip label="View live chat" position="top" withArrow>
            <IconMessage className="cursor-p" size={20} onClick={handleOpenChat} />
          </Tooltip>

          <Tooltip label={isFocused ? 'Unfocus stream' : 'Focus stream'} position="top" withArrow>
            <IconFocusCentered className="cursor-p" size={20} onClick={() => props.onToggleFocus(stream.id)} />
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
            <IconTrash className="cursor-p" size={20} onClick={handleOpenRemoveConfirm} />
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
          id={stream.id}
          ref={playerRef}
          src={playerUrl}
          title={stream.title}
          allowFullScreen={false}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </VideoFrame>

      <RemoveModal
        stream={stream}
        onRemove={props.onRemove}
        opened={isRemoveConfirmOpen}
        onClose={handleCloseRemoveConfirm}
      />
    </StreamCardWrap>
  )
}

export default memo(StreamCardItem)

const StreamCardWrap = styled.div<{ $isFocused?: boolean }>`
  display: flex;
  flex-direction: column;

  gap: 8px;

  border: 1px solid #243353;
  background: radial-gradient(circle at top right, rgba(45, 198, 255, 0.07), transparent 42%), #101a2f;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(2, 7, 16, 0.32);

  padding: 8px;

  aspect-ratio: 16 / 9;

  ${({ $isFocused: isFocused }) =>
    isFocused &&
    css`
      position: fixed;
      z-index: 99;
      width: min(96vw, 1300px);
      max-width: 100vw;
      max-height: 92vh;
      aspect-ratio: 16 / 10;
      margin: auto;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      overflow: auto;
      box-sizing: border-box;
    `}

  .cursor-p {
    cursor: pointer;
  }
`

const VideoFrame = styled.div<{ $isFocused?: boolean }>`
  position: relative;
  width: 100%;
  flex: 1;

  border-radius: 12px;
  overflow: hidden;
  background: #080f1d;

  ${({ $isFocused }) =>
    $isFocused
      ? css`
          aspect-ratio: 16 / 10;
        `
      : css`
          aspect-ratio: 16 / 9;
        `}

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    object-fit: ${({ $isFocused }) => ($isFocused ? 'contain' : 'cover')};
  }
`
