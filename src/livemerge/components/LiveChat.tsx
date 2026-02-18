import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import styled from 'styled-components'

import { IconMinus, IconX } from '@tabler/icons-react'

type Props = {
  chatUrl: string | null
  onClose: () => void
}

const MOBILE_BREAKPOINT = 768
const EDGE_MARGIN_DESKTOP = 8
const EDGE_MARGIN_MOBILE = 6

const getViewportMargin = () => (window.innerWidth <= MOBILE_BREAKPOINT ? EDGE_MARGIN_MOBILE : EDGE_MARGIN_DESKTOP)

const clampPosition = (x: number, y: number, width: number, height: number) => {
  const margin = getViewportMargin()
  const maxX = Math.max(margin, window.innerWidth - width - margin)
  const maxY = Math.max(margin, window.innerHeight - height - margin)

  return {
    x: Math.min(maxX, Math.max(margin, x)),
    y: Math.min(maxY, Math.max(margin, y))
  }
}

const LiveChat = ({ chatUrl, onClose }: Props) => {
  const chatRef = useRef<HTMLElement | null>(null)
  const chatDragStateRef = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0
  })

  const [isChatMinimized, setIsChatMinimized] = useState(false)

  const [chatPosition, setChatPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!chatUrl || chatPosition) return

    const frame = window.requestAnimationFrame(() => {
      const panel = chatRef.current
      const width = panel?.offsetWidth ?? 380
      const height = panel?.offsetHeight ?? 560

      setChatPosition(clampPosition(window.innerWidth - width - 24, window.innerHeight - height - 96, width, height))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [chatPosition, chatUrl])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!chatDragStateRef.current.dragging) return

      const panel = chatRef.current
      if (!panel) return

      const width = panel.offsetWidth
      const height = panel.offsetHeight

      const nextX = event.clientX - chatDragStateRef.current.offsetX
      const nextY = event.clientY - chatDragStateRef.current.offsetY

      setChatPosition(clampPosition(nextX, nextY, width, height))
    }

    const handlePointerUp = () => {
      chatDragStateRef.current.dragging = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    if (!chatPosition) return

    const handleResize = () => {
      const panel = chatRef.current
      if (!panel) return

      setChatPosition((current) => {
        if (!current) return current

        return clampPosition(current.x, current.y, panel.offsetWidth, panel.offsetHeight)
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [chatPosition])

  const handleChatPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const panel = chatRef.current
    if (!panel) return

    const rect = panel.getBoundingClientRect()
    chatDragStateRef.current = {
      dragging: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    }
  }

  if (!chatUrl) return null

  return (
    <Container
      ref={chatRef}
      style={{
        left: chatPosition?.x ?? 24,
        top: chatPosition?.y ?? 96
      }}
      aria-expanded={!isChatMinimized}
    >
      <FloatingChatHeader onPointerDown={handleChatPointerDown}>
        Live Chat
        <FloatingChatControls onPointerDown={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsChatMinimized((current) => !current)}
            aria-label={isChatMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            <IconMinus size={16} />
          </button>
          <button type="button" onClick={onClose} aria-label="Close chat">
            <IconX size={16} />
          </button>
        </FloatingChatControls>
      </FloatingChatHeader>
      {!isChatMinimized && (
        <FloatingChatBody>
          <iframe title="Live chat" src={chatUrl} />
        </FloatingChatBody>
      )}
    </Container>
  )
}

export default LiveChat

const Container = styled.section`
  position: fixed;
  width: min(380px, calc(100vw - 16px));
  height: min(72vh, 560px);
  max-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  border: 1px solid #243353;
  border-radius: 12px;
  overflow: hidden;
  background: #0e1728;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.5);
  z-index: 221;

  @media (max-width: 768px) {
    width: calc(100vw - 12px);
    height: min(58vh, 420px);
    max-height: calc(100vh - 12px);
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    width: calc(100vw - 8px);
    height: min(56vh, 360px);
    max-height: calc(100vh - 8px);
    border-radius: 8px;
  }

  &[aria-expanded='false'] {
    height: auto;
  }
`

export const FloatingChatWrap = styled.section`
  position: fixed;
  width: min(380px, calc(100vw - 24px));
  height: min(72vh, 560px);
  display: flex;
  flex-direction: column;
  border: 1px solid #243353;
  border-radius: 12px;
  overflow: hidden;
  background: #0e1728;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.5);
  z-index: 221;

  @media (max-width: 768px) {
    width: calc(100vw - 24px);
  }
`

export const FloatingChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 8px 10px;
  background: #141f34;
  border-bottom: 1px solid #223254;
  color: #d5e4ff;
  font-size: 14px;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  touch-action: none;
`

export const FloatingChatControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #2b3f67;
    border-radius: 8px;
    color: #d5e4ff;
    background: #10203a;
    cursor: pointer;
  }
`

export const FloatingChatBody = styled.div`
  flex: 1;
  background: #080f1d;

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`
