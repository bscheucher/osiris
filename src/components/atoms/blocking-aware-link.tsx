import Link from 'next/link'
import { ComponentProps } from 'react'

import { useNavigationBlocker } from '@/contexts/navigation-blocker-context'

export type OnNavigateEvent = {
  preventDefault: () => void
}

export const BlockingAwareLink = ({
  children,
  ...props
}: ComponentProps<typeof Link>) => {
  const { isBlocked, setPendingRoute } = useNavigationBlocker()

  const handleNavigate = (e: OnNavigateEvent) => {
    if (isBlocked) {
      e.preventDefault()
      setPendingRoute(props.href.toString())
    }
  }

  return (
    <Link {...props} onNavigate={handleNavigate}>
      {children}
    </Link>
  )
}
