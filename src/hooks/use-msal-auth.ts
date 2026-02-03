'use client'

import { useMsal, useAccount, useIsAuthenticated } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { useCallback, useEffect, useState } from 'react'

import { tokenRequest } from '@/lib/config/msal-config'
import { User } from '@/lib/interfaces/user'
import { setUser, getUser as getUserFromCookie } from '@/lib/utils/api-utils'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL

interface UseMsalAuthResult {
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  user: User | null
  getAccessToken: () => Promise<string | null>
  logout: () => Promise<void>
}

export function useMsalAuth(): UseMsalAuthResult {
  const { instance, accounts, inProgress } = useMsal()
  const account = useAccount(accounts[0] || null)
  const isAuthenticated = useIsAuthenticated()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) {
      return null
    }

    try {
      // Try to acquire token silently first
      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account,
      })
      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // If silent token acquisition fails, fall back to interactive method
        try {
          const response = await instance.acquireTokenRedirect({
            ...tokenRequest,
            account,
          })
          return null // Will redirect, so return null
        } catch (interactiveError) {
          console.error('Interactive token acquisition failed:', interactiveError)
          return null
        }
      }
      console.error('Silent token acquisition failed:', error)
      return null
    }
  }, [instance, account])

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${GATEWAY_URL}/benutzer/get`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const userData = await response.json()
      if (userData?.error) {
        throw new Error(userData.error)
      }

      // Store user in cookie for server components
      await setUser(userData)
      setUserState(userData)
      return userData
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${GATEWAY_URL}/benutzer/logout`, {
        cache: 'no-store',
      })
    } catch (error) {
      console.error('Backend logout failed:', error)
    }

    // Clear local state
    setAccessToken(null)
    setUserState(null)

    // Logout from MSAL
    await instance.logoutRedirect({
      postLogoutRedirectUri: '/login',
    })
  }, [instance])

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (inProgress !== 'none') {
        return // Wait for any ongoing interactions to complete
      }

      if (!isAuthenticated || !account) {
        setIsLoading(false)
        return
      }

      try {
        const token = await getAccessToken()
        if (token) {
          setAccessToken(token)

          // Try to get user from cookie first
          const cachedUser = await getUserFromCookie()
          if (cachedUser) {
            setUserState(cachedUser)
          } else {
            // Fetch user data if not cached
            await fetchUserData(token)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [isAuthenticated, account, inProgress, getAccessToken, fetchUserData])

  return {
    isAuthenticated,
    isLoading: isLoading || inProgress !== 'none',
    accessToken,
    user,
    getAccessToken,
    logout,
  }
}
