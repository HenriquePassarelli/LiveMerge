import { memo, useEffect, useRef } from 'react'

type YouTubePlayerInstance = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getIframe: () => HTMLIFrameElement
  getPlayerState: () => number
  mute: () => void
  playVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
}

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string
    playerVars: Record<string, number | string>
    events: {
      onReady: () => void
      onStateChange: (event: { data: number }) => void
    }
  }
) => YouTubePlayerInstance

declare global {
  interface Window {
    YT?: { Player: YouTubePlayerConstructor }
    onYouTubeIframeAPIReady?: () => void
  }
}

let iframeApiPromise: Promise<YouTubePlayerConstructor> | undefined

const loadIframeApi = (): Promise<YouTubePlayerConstructor> => {
  if (window.YT?.Player) return Promise.resolve(window.YT.Player)

  if (!iframeApiPromise) {
    iframeApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onerror = () => {
        // Forget the failed attempt so the next player can try to load the API again.
        iframeApiPromise = undefined
        script.remove()
        reject(new Error('Unable to load the YouTube IFrame API'))
      }

      const previousOnReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousOnReady?.()
        if (window.YT?.Player) resolve(window.YT.Player)
      }

      document.head.append(script)
    })
  }

  return iframeApiPromise
}

type YouTubePlayerProps = {
  onLiveEnded?: () => void
  shouldAutoplay: boolean | undefined
  title?: string
  videoId: string
}

const DEFAULT_IFRAME_TITLE = 'YouTube video player'
const PLAYER_STATE_ENDED = 0
const PLAYER_STATE_PLAYING = 1

const LIVE_EDGE_TOLERANCE_SECONDS = 60
const LIVE_EDGE_BUFFER_SECONDS = 30
const LIVE_EDGE_STARTUP_DELAY_MS = 2_000
const LIVE_EDGE_SYNC_INTERVAL_MS = 1_000
const LIVE_EDGE_SEEK_RETRY_DELAY_MS = 10_000
const LIVE_EDGE_POLLING_GIVE_UP_MS = 2 * 60 * 1000
const MAX_LIVE_EDGE_SEEK_ATTEMPTS = 3

const YouTubePlayer = ({ onLiveEnded, shouldAutoplay, title, videoId }: YouTubePlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayerInstance | undefined>(undefined)
  const onLiveEndedRef = useRef(onLiveEnded)
  const titleRef = useRef(title)

  useEffect(() => {
    onLiveEndedRef.current = onLiveEnded
  }, [onLiveEnded])

  // The title only labels the iframe, so a rename must not rebuild (and reload) the player.
  useEffect(() => {
    titleRef.current = title

    try {
      if (playerRef.current) playerRef.current.getIframe().title = title ?? DEFAULT_IFRAME_TITLE
    } catch {
      // The iframe is gone; nothing to label.
    }
  }, [title])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // The YouTube API replaces the element it is given with its iframe. Giving it a throwaway child keeps
    // React's own container in the DOM, so the next player (new video or autoplay change) has a place to mount.
    const target = document.createElement('div')
    container.append(target)

    let player: YouTubePlayerInstance | undefined
    let intervalId: ReturnType<typeof setInterval> | undefined
    let isDisposed = false
    let hasSyncedToLiveEdge = false
    let seekAttempts = 0
    let lastSeekAt = 0
    let playbackStartedAt: number | undefined
    let pollingStartedAt = 0

    const stopPolling = () => {
      if (intervalId) clearInterval(intervalId)
      intervalId = undefined
    }

    // Returns true once there is nothing left to do (synced, or gave up after the allowed attempts).
    const syncToLiveEdge = (): boolean => {
      if (hasSyncedToLiveEdge) return true
      if (!player || player.getPlayerState() !== PLAYER_STATE_PLAYING) return false
      if (!playbackStartedAt || Date.now() - playbackStartedAt < LIVE_EDGE_STARTUP_DELAY_MS) return false

      const duration = player.getDuration()
      const currentTime = player.getCurrentTime()

      if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return false

      const behindLiveEdge = duration - currentTime
      if (behindLiveEdge <= LIVE_EDGE_TOLERANCE_SECONDS) {
        hasSyncedToLiveEdge = true
        return true
      }

      if (seekAttempts >= MAX_LIVE_EDGE_SEEK_ATTEMPTS) {
        hasSyncedToLiveEdge = true
        return true
      }

      if (Date.now() - lastSeekAt < LIVE_EDGE_SEEK_RETRY_DELAY_MS) return false

      lastSeekAt = Date.now()
      seekAttempts += 1
      player.seekTo(Math.max(duration - LIVE_EDGE_BUFFER_SECONDS, 0), true)
      return false
    }

    const trySyncToLiveEdge = () => {
      if (isDisposed) {
        stopPolling()
        return
      }

      try {
        // Polling also stops after a while (for example when the stream has no seekable duration),
        // and starts again the next time playback begins.
        if (syncToLiveEdge() || Date.now() - pollingStartedAt > LIVE_EDGE_POLLING_GIVE_UP_MS) stopPolling()
      } catch {
        stopPolling()
      }
    }

    const startPolling = () => {
      if (intervalId || hasSyncedToLiveEdge) return

      pollingStartedAt = Date.now()
      intervalId = setInterval(trySyncToLiveEdge, LIVE_EDGE_SYNC_INTERVAL_MS)
    }

    void loadIframeApi()
      .then((Player) => {
        if (isDisposed) return

        player = new Player(target, {
          videoId,
          playerVars: {
            autoplay: shouldAutoplay ? 1 : 0,
            mute: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            autohide: 0,
            playsinline: 1,
            origin: window.location.origin,
            disablekb: 1
          },
          events: {
            onReady: () => {
              if (isDisposed || !player) return

              playerRef.current = player
              player.getIframe().title = titleRef.current ?? DEFAULT_IFRAME_TITLE

              if (shouldAutoplay) {
                player.mute()
                player.playVideo()
                startPolling()
              }
            },
            onStateChange: (event) => {
              if (isDisposed || !shouldAutoplay) return

              if (event.data === PLAYER_STATE_PLAYING) {
                playbackStartedAt ??= Date.now()
                startPolling()
              }

              if (event.data === PLAYER_STATE_ENDED) onLiveEndedRef.current?.()
            }
          }
        })
      })
      .catch((error: unknown) => console.error('Unable to initialize the YouTube player:', error))

    return () => {
      isDisposed = true
      stopPolling()
      playerRef.current = undefined

      try {
        player?.destroy()
      } catch {
        // The iframe was already removed.
      }

      container.replaceChildren()
    }
  }, [shouldAutoplay, videoId])

  return <div ref={containerRef} />
}

export default memo(YouTubePlayer)
