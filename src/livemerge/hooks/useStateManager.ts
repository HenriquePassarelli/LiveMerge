import { STORAGE_KEYS } from '../constants'
import type { Stream, UserPreferences } from '../types/types'
import { useStorage } from './useStorage'

type UseStateManagerReturn = {
  streams: Stream[]
  channels: string[]
  userPreferences: UserPreferences
  addStream: (stream: Stream) => void
  addChannel: (channelId: string) => void
  removeStream: (streamId: string) => void
  removeChannel: (channelId: string) => void
  updateStream: (streamId: string, updates: Partial<Stream>) => void
  updateUserPreferences: (preferences: UserPreferences) => void
}

export const useStateManager = (): UseStateManagerReturn => {
  const [streams, setStreams] = useStorage<Stream[]>(STORAGE_KEYS.streams, [])
  const [channels, setChannels] = useStorage<string[]>(STORAGE_KEYS.channels, [])
  const [userPreferences, setUserPreferences] = useStorage<UserPreferences>(
    STORAGE_KEYS.preferences,
    {} as UserPreferences
  )

  const addStream = (stream: Stream) => {
    setStreams((prev) => [...prev, stream])
  }

  const removeStream = (streamId: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== streamId))
  }

  const updateStream = (streamId: string, updates: Partial<Stream>) => {
    setStreams((prev) => prev.map((stream) => (stream.id === streamId ? { ...stream, ...updates } : stream)))
  }

  const addChannel = (channelId: string) => {
    setChannels((prev) => [...new Set([...prev, channelId])])
  }

  const removeChannel = (channelId: string) => {
    setChannels((prev) => [...new Set([...prev].filter((id) => id !== channelId))])
  }

  const updateUserPreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
  }

  return {
    streams,
    channels,
    userPreferences,
    addStream,
    addChannel,
    removeStream,
    removeChannel,
    updateStream,
    updateUserPreferences
  }
}
