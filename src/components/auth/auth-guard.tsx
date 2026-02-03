'use client'

import {
  useIsAuthenticated,
  useMsal,
  useMsalAuthentication,
} from '@azure/msal-react'
import { InteractionType, InteractionStatus } from '@azure/msal-browser'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

import { loginRequest } from '@/lib/config/msal-config'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useIsAuthenticated()
  const { inProgress } = useMsal()
  const router = useRouter()

  // This hook will automatically trigger a login redirect if not authenticated
  const { error } = useMsalAuthentication(InteractionType.Silent, loginRequest)

  useEffect(() => {
    // If not authenticated and no interaction in progress, redirect to login
    if (
      !isAuthenticated &&
      inProgress === InteractionStatus.None &&
      error
    ) {
      router.push('/login')
    }
  }, [isAuthenticated, inProgress, error, router])

  // Show loading while checking authentication
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
