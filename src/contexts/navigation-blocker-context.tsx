'use client'

import { noop } from 'lodash-es'
import { createContext, useContext, useState } from 'react'

type NavigationBlockerContextType = {
  isBlocked: boolean
  setIsBlocked: (isBlocked: boolean) => void
  pendingRoute: string | null
  setPendingRoute: (pendingRoute: string | null) => void
}

export const NavigationBlockerContext =
  createContext<NavigationBlockerContextType>({
    isBlocked: false,
    setIsBlocked: noop,
    pendingRoute: null,
    setPendingRoute: noop,
  })

export function NavigationBlockerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  return (
    <NavigationBlockerContext.Provider
      value={{
        isBlocked,
        setIsBlocked,
        pendingRoute,
        setPendingRoute,
      }}
    >
      {children}
    </NavigationBlockerContext.Provider>
  )
}

export function useNavigationBlocker() {
  return useContext(NavigationBlockerContext)
}
