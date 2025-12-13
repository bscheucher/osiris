'use client'

import { SessionProvider, SessionProviderProps } from 'next-auth/react'
import { ReactNode } from 'react'

type NextAuthProviderProps = {
  children: ReactNode
  session?: SessionProviderProps['session']
}

export default function NextAuthProvider({
  children,
  session,
}: NextAuthProviderProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}
