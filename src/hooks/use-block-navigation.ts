import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

type UseBlockNavigationProps = {
  blockCondition: boolean
}

export const useBlockNavigation = ({
  blockCondition,
}: UseBlockNavigationProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const [shouldBlock, setShouldBlock] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  const originalPushRef = useRef(router.push)
  const lastLocationRef = useRef<string | null>(null)

  const handleProceed = useCallback(() => {
    if (pendingRoute) {
      setShouldBlock(false)
      setPendingRoute(null)

      setTimeout(() => {
        originalPushRef.current(pendingRoute)
      }, 300)
    }
  }, [pendingRoute])

  const handleCancel = useCallback(() => {
    setShouldBlock(false)
    setPendingRoute(null)
  }, [])

  useEffect(() => {
    router.push = ((url, _opts) => {
      if (!blockCondition || url === pathname) {
        originalPushRef.current(url)
        return
      }
      setShouldBlock(true)
      setPendingRoute(url)
    }) as typeof router.push

    const storedPushRef = originalPushRef.current
    return () => void (router.push = storedPushRef)
  }, [blockCondition, pathname, router])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (blockCondition) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () =>
      void window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [blockCondition])

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      if (blockCondition) {
        event.preventDefault()
        const previousURL = lastLocationRef.current || document.referrer || '/'
        setShouldBlock(true)
        setPendingRoute(previousURL)
        history.pushState(null, '', window.location.href)
      }
    }

    lastLocationRef.current = pathname
    history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handleBackButton)

    return () => void window.removeEventListener('popstate', handleBackButton)
  }, [blockCondition, pathname])

  return { shouldBlock, handleProceed, handleCancel }
}
