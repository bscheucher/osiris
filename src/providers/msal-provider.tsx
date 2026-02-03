'use client'

import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  IPublicClientApplication,
} from '@azure/msal-browser'
import { MsalProvider as MsalReactProvider } from '@azure/msal-react'
import { ReactNode, useEffect, useState } from 'react'

import { msalConfig } from '@/lib/config/msal-config'

// Create MSAL instance
let msalInstance: IPublicClientApplication | null = null

function getMsalInstance(): IPublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
  }
  return msalInstance
}

type MsalProviderProps = {
  children: ReactNode
}

export default function MsalProvider({ children }: MsalProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [instance, setInstance] = useState<IPublicClientApplication | null>(
    null
  )

  useEffect(() => {
    const initializeMsal = async () => {
      const pca = getMsalInstance()

      // Initialize the MSAL instance
      await pca.initialize()

      // Handle redirect promise after login
      await pca.handleRedirectPromise()

      // Set active account if one exists
      const accounts = pca.getAllAccounts()
      if (accounts.length > 0) {
        pca.setActiveAccount(accounts[0])
      }

      // Register event callbacks
      pca.addEventCallback((event: EventMessage) => {
        if (
          event.eventType === EventType.LOGIN_SUCCESS &&
          event.payload !== null
        ) {
          const payload = event.payload as AuthenticationResult
          pca.setActiveAccount(payload.account)
        }
      })

      setInstance(pca)
      setIsInitialized(true)
    }

    initializeMsal()
  }, [])

  if (!isInitialized || !instance) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <MsalReactProvider instance={instance}>{children}</MsalReactProvider>
}

// Export a function to get the MSAL instance for use in server components or utilities
export function getMsalInstanceForClient(): IPublicClientApplication | null {
  return msalInstance
}
