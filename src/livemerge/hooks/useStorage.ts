import { useCallback, useState } from 'react'

export function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

type UseStorageReturn<T> = [T, (value: T | ((prev: T) => T)) => void]

export const useStorage = <T>(key: string, fallback: T): UseStorageReturn<T> => {
  const [state, setState] = useState<T>(() => safeRead<T>(key, fallback))

  const setStorage = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        saveToStorage(key, newValue)
        return newValue
      })
    },
    [key]
  )

  return [state, setStorage]
}
