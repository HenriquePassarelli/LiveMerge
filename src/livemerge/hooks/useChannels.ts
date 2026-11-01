import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stream } from '../types/types'
import { normalizeStreamInput } from '../utils/utils'
import { getChannelStatus } from '../services/getChannelStatus'
import { STORAGE_KEYS } from '../constants'
import { useStorage } from './useStorage'
import _ from 'lodash'

type Return = {
  channelStreams: Stream[]
  // Channels whose last live-status check failed. Not persisted; cleared by the next successful check.
  channelErrors: Record<string, boolean>
  loadChannel: (channelId: string) => Promise<boolean>
  reloadChannel: (channelId: string) => void
  removeChannelStream: (channelId: string) => void
  markChannelOffline: (channelId: string) => void
}

// Offline (or failing) channels are re-checked on this interval so a channel that goes live is picked up quickly.
// The server caches each answer for 60s, so many open tabs share one upstream request.
const OFFLINE_REFRESH_INTERVAL_MS = 60 * 1000

// Live channels are verified less often, in case a stream ended without the player noticing
// or the channel moved on to a new broadcast.
const LIVE_VERIFY_INTERVAL_MS = 5 * 60 * 1000

const useChannels = (channels: string[]): Return => {
  const [streams, setStreams] = useStorage<Stream[]>(STORAGE_KEYS.channelStreams, [])
  const [channelErrors, setChannelErrors] = useState<Record<string, boolean>>({})
  const channelRef = useRef<Set<string>>(
    new Set(streams.flatMap((stream) => (stream.channelId ? [stream.channelId] : [])))
  )
  const channelRequestRef = useRef<Map<string, number>>(new Map())

  const setChannelError = useCallback((channelId: string, hasError: boolean) => {
    setChannelErrors((current) => {
      if (Boolean(current[channelId]) === hasError) return current

      const next = { ...current }
      if (hasError) next[channelId] = true
      else delete next[channelId]

      return next
    })
  }, [])

  const getChannel = useCallback(
    async (channelId: string, force?: boolean, requireTitle?: boolean): Promise<boolean> => {
      const alreadyFetched = channelRef.current.has(channelId)
      if (alreadyFetched && !force) return true

      const requestVersion = (channelRequestRef.current.get(channelId) ?? 0) + 1
      channelRequestRef.current.set(channelId, requestVersion)

      const status = await getChannelStatus(channelId)

      // A newer request (or a removal) superseded this one.
      if (channelRequestRef.current.get(channelId) !== requestVersion) return false

      if (!status) {
        console.error('Failed to fetch live status for channel:', channelId)
        // Only flag channels that are already on screen; a failed add is reported by the add flow.
        if (alreadyFetched) setChannelError(channelId, true)
        return false
      }

      // When adding a channel, a missing name means the feed could not be read, so refuse it.
      if (requireTitle && !status.title) {
        console.error('No channel name returned for channel:', channelId, status.nameError)
        return false
      }

      const title = status.title || `Channel ${channelId}`

      let stream: Stream

      if (status.isLive && status.videoId) {
        const urls = normalizeStreamInput(`https://www.youtube.com/watch?v=${status.videoId}`)

        stream = {
          id: channelId,
          title,
          originalUrl: urls.originalUrl,
          embedUrl: urls.embedUrl,
          chatUrl: urls.chatUrl,
          channelId,
          isLive: true,
          shouldAutoplay: true
        }
      } else {
        stream = {
          id: channelId,
          title,
          originalUrl: '',
          embedUrl: '',
          chatUrl: '',
          channelId,
          isLive: false,
          shouldAutoplay: false
        }
      }

      channelRef.current.add(channelId)
      setChannelError(channelId, false)

      setStreams((prev) => {
        // Keep the same array when nothing changed, so a periodic check does not re-render or remount players.
        if (prev.some((existing) => _.isEqual(existing, stream))) return prev

        return _.uniqBy([stream, ...prev], (s) => s.id)
      })

      return true
    },
    // setStreams only uses functional updates, so the first closure stays valid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setChannelError]
  )

  useEffect(() => {
    const fetchStreams = async (force = false, channelIds = channels) => {
      try {
        await Promise.all(channelIds.map((channelId) => getChannel(channelId, force)))
      } catch (error) {
        console.error('Error fetching streams for channels:', error)
      }
    }

    void fetchStreams()

    const isLiveChannel = (channelId: string) =>
      streams.find((stream) => stream.channelId === channelId)?.isLive === true

    // Offline channels, and any channel whose last check failed, are retried every minute.
    const retryChannelIds = channels.filter((channelId) => !isLiveChannel(channelId) || channelErrors[channelId])
    const liveChannelIds = channels.filter((channelId) => isLiveChannel(channelId) && !channelErrors[channelId])

    const intervalIds: ReturnType<typeof setInterval>[] = []

    if (retryChannelIds.length) {
      intervalIds.push(setInterval(() => void fetchStreams(true, retryChannelIds), OFFLINE_REFRESH_INTERVAL_MS))
    }

    if (liveChannelIds.length) {
      intervalIds.push(setInterval(() => void fetchStreams(true, liveChannelIds), LIVE_VERIFY_INTERVAL_MS))
    }

    return () => intervalIds.forEach((intervalId) => clearInterval(intervalId))
  }, [channelErrors, channels, getChannel, streams])

  // Saved channel state can be stale (a stream that was live yesterday, or an "offline" saved before it went live),
  // so every saved channel is re-checked once when the app loads.
  useEffect(() => {
    channels.forEach((channelId) => void getChannel(channelId, true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Used when adding a channel: resolves true once its name and live status are loaded and stored.
  // Fails when the channel name is missing.
  const loadChannel = (channelId: string) => getChannel(channelId, true, true)

  const reloadChannel = (channelId: string) => {
    void getChannel(channelId, true)
  }

  const removeChannelStream = useCallback(
    (channelId: string) => {
      channelRequestRef.current.set(channelId, (channelRequestRef.current.get(channelId) ?? 0) + 1)
      channelRef.current.delete(channelId)
      setChannelError(channelId, false)
      setStreams((current) => current.filter((stream) => stream.channelId !== channelId))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setChannelError]
  )

  const markChannelOffline = useCallback(
    (channelId: string) => {
      setStreams((current) =>
        current.map((stream) =>
          stream.channelId === channelId ? { ...stream, isLive: false, shouldAutoplay: false } : stream
        )
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {
    channelStreams: streams,
    channelErrors,
    loadChannel,
    reloadChannel,
    removeChannelStream,
    markChannelOffline
  }
}

export default useChannels
