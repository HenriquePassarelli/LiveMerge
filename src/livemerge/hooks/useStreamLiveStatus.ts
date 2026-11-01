import { useEffect, useRef } from 'react'
import type { Stream } from '../types/types'
import { getVideoLiveStatus } from '../services/getVideoLiveStatus'
import { getYouTubeVideoId } from '../utils/youtube.utils'

// Streams that were live get re-verified on this interval, in case the broadcast ended.
const LIVE_VERIFY_INTERVAL_MS = 5 * 60 * 1000

// A manually added stream saves `shouldAutoplay` from the live check made when it was added.
// That answer goes stale (a live stream ends, an upcoming one starts), so it is re-checked:
// once on load for every stream, then every few minutes for streams currently marked live.
export const useStreamLiveStatus = (
  streams: Stream[],
  updateStream: (streamId: string, updates: Partial<Stream>) => void
) => {
  const streamsRef = useRef(streams)
  const updateStreamRef = useRef(updateStream)

  useEffect(() => {
    streamsRef.current = streams
    updateStreamRef.current = updateStream
  })

  useEffect(() => {
    const checkStreams = async (onlyLive: boolean) => {
      const candidates = streamsRef.current.filter((stream) => !onlyLive || stream.shouldAutoplay)

      await Promise.all(
        candidates.map(async (stream) => {
          const videoId = getYouTubeVideoId(stream.originalUrl || stream.embedUrl)
          if (!videoId) return

          const isLive = await getVideoLiveStatus(videoId)

          // undefined means the check failed: keep what we have rather than guessing.
          if (isLive === undefined) return

          const current = streamsRef.current.find((item) => item.id === stream.id)
          if (!current || Boolean(current.shouldAutoplay) === isLive) return

          updateStreamRef.current(stream.id, { shouldAutoplay: isLive })
        })
      )
    }

    void checkStreams(false)

    const intervalId = setInterval(() => void checkStreams(true), LIVE_VERIFY_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [])
}
