import { useCallback, useRef, useEffect } from 'react'
import { STORAGE_KEYS } from '../constants'
import { useStorage } from './useStorage'

type Return = {
  userToken?: string
  handleGoogleSignIn: () => void
  getToken: () => string | undefined
  isTokenExpired: () => boolean
  removeToken: () => void
}

const useGoogleAuth = (): Return => {
  const tokenRef = useRef<string | undefined>(undefined)
  const expireDateRef = useRef<number | undefined>(undefined)

  const [expireDate, setExpireDate] = useStorage<number | undefined>(STORAGE_KEYS.tokenExpireDate, undefined)
  const [userToken, setUserToken] = useStorage<string | undefined>(STORAGE_KEYS.userToken, undefined)

  useEffect(() => {
    tokenRef.current = userToken
    expireDateRef.current = expireDate
  }, [userToken, expireDate])

  // Remove token and expiration
  const removeToken = useCallback(() => {
    setUserToken(undefined)
    setExpireDate(undefined)
  }, [setUserToken, setExpireDate])

  const isTokenExpired = useCallback(() => {
    const isExpired = expireDateRef.current ? Date.now() > Number(expireDateRef.current) : true
    if (isExpired) {
      removeToken()
    }

    return isExpired
  }, [removeToken])

  const getToken = useCallback(() => {
    if (isTokenExpired()) {
      return undefined
    }

    return tokenRef.current
  }, [isTokenExpired])

  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const scope = 'https://www.googleapis.com/auth/youtube.readonly'
    const redirectUri = `${window.location.origin}/oauth-redirect.html`
    // Use implicit flow for now (response_type=token)
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}`

    // Open popup for OAuth
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    window.open(authUrl, 'GoogleOAuth', `width=${width},height=${height},left=${left},top=${top}`)

    // Listen for access token and expiration from redirect handler
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (
        event.data &&
        typeof event.data === 'object' &&
        'googleAccessToken' in event.data &&
        'googleTokenExpireDate' in event.data
      ) {
        const token = event.data.googleAccessToken
        const expireDate = event.data.googleTokenExpireDate
        setExpireDate((expireDateRef.current = expireDate))
        setUserToken((tokenRef.current = token))

        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }

  return { userToken, handleGoogleSignIn, getToken, isTokenExpired, removeToken }
}

export default useGoogleAuth
