import { STORAGE_KEYS } from '../constants'
import type { Stream, UserPreferences } from '../types'
import { useStorage } from './useStorage'

type UseStateManagerReturn = {
  streams: Stream[]
  userPreferences: UserPreferences
  addStream: (stream: Stream) => void
  removeStream: (streamId: string) => void
  updateStream: (streamId: string, updates: Partial<Stream>) => void
  updateUserPreferences: (preferences: UserPreferences) => void
}

export const useStateManager = (): UseStateManagerReturn => {
  const [streams, setStreams] = useStorage<Stream[]>(STORAGE_KEYS.streams, [])
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

  const updateUserPreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
  }

  return {
    streams,
    userPreferences,
    addStream,
    removeStream,
    updateStream,
    updateUserPreferences
  }
}
