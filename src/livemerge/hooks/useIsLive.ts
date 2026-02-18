import { useEffect, useState } from 'react'

const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const

type YouTubeMessage =
  | {
      event?: string
      info?: number | { playerState?: number }
    }
  | undefined

// TODO: Not working

const useIsLive = (iframeRef: React.RefObject<HTMLIFrameElement | null>) => {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const updateLiveFromPlayerState = (playerState: number) => {
      // Keep hook contract as boolean while using playback status from the IFrame API.
      setIsLive(playerState === PLAYER_STATE.PLAYING || playerState === PLAYER_STATE.BUFFERING)
    }

    const sendPlayerCommand = (func: string, args: unknown[] = []) => {
      const frameWindow = iframe.contentWindow
      if (!frameWindow) return

      frameWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
    }

    const handleMessage = (event: MessageEvent<string>) => {
      if (event.source !== iframe.contentWindow) return

      let data: YouTubeMessage
      try {
        data = typeof event.data === 'string' ? (JSON.parse(event.data) as YouTubeMessage) : undefined
      } catch {
        return
      }

      if (!data) return

      if (data.event === 'onReady') {
        sendPlayerCommand('getPlayerState')
        return
      }

      if (data.event === 'onStateChange' && typeof data.info === 'number') {
        updateLiveFromPlayerState(data.info)
        return
      }

      if (data.event === 'infoDelivery' && typeof data.info === 'object' && typeof data.info.playerState === 'number') {
        updateLiveFromPlayerState(data.info.playerState)
      }
    }

    const handleLoad = () => {
      sendPlayerCommand('addEventListener', ['onReady'])
      sendPlayerCommand('addEventListener', ['onStateChange'])
      sendPlayerCommand('getPlayerState')
    }

    window.addEventListener('message', handleMessage)
    iframe.addEventListener('load', handleLoad)
    handleLoad()

    return () => {
      window.removeEventListener('message', handleMessage)
      iframe.removeEventListener('load', handleLoad)
    }
  }, [iframeRef])

  return isLive
}

export default useIsLive
