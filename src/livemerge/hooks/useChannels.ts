import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stream } from '../types/types'
import { normalizeStreamInput } from '../utils/utils'
import { getChannelInfo } from '../services/getChannelInfo'
import { getLiveStream } from '../services/getLiveStream'
import _ from 'lodash'

type Return = {
  channelStreams: Stream[]
  reloadChannel: (channelId: string) => void
}

const useChannels = (channels: string[], getToken: () => string | undefined): Return => {
  const channelRef = useRef<Set<string>>(new Set())
  const [streams, setStreams] = useState<Stream[]>([])

  const getChannel = useCallback(
    async (channelId: string, force?: boolean) => {
      const token = getToken()
      if (!token) return

      const alreadyFetched = channelRef.current.has(channelId)
      if (alreadyFetched && !force) return

      const result = await getLiveStream(channelId, token)

      if (!result) {
        console.error('Failed to fetch live stream data for channel:', channelId)
        return
      }

      const channelInfo = result.items?.[0]

      if (!channelInfo) {
        // Fetch channel name from channels API when not broadcasting
        getChannelInfo(channelId, token).then((channelName) => {
          console.log('Channel is not live. Adding with channel name:', channelName)

          const stream: Stream = {
            id: channelId,
            title: channelName || `Channel ${channelId}`,
            originalUrl: '',
            embedUrl: '',
            chatUrl: '',
            channelId: channelId,
            isLive: false
          }
          channelRef.current.add(channelId)
          setStreams((prev) => _.uniqBy([stream, ...prev], (s) => s.id))
        })
        return
      }

      const urls = normalizeStreamInput(`https://www.youtube.com/watch?v=${channelInfo.id.videoId}`)

      const stream: Stream = {
        id: channelInfo.snippet.channelId,
        title: channelInfo.snippet.channelTitle,
        originalUrl: urls.originalUrl,
        embedUrl: urls.embedUrl,
        chatUrl: urls.chatUrl,
        channelId: channelId,
        isLive: true
      }

      channelRef.current.add(channelId)

      setStreams((prev) => _.uniqBy([stream, ...prev], (s) => s.id))
    },
    [getToken]
  )

  useEffect(() => {
    const token = getToken()
    console.log(token)
    if (!token) return

    const fetchStreams = async () => {
      const promises = channels.map((ch) => getChannel(ch))

      try {
        await Promise.all(promises)
      } catch (error) {
        console.error('Error fetching streams for channels:', error)
        return
      }
    }

    fetchStreams()
  }, [channels, getChannel, getToken])

  const reloadChannel = (channelId: string) => {
    getChannel(channelId, true)
  }

  return {
    channelStreams: streams,
    reloadChannel
  }
}

export default useChannels
