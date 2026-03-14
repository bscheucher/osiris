'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import { useNavigationBlocker } from '@/contexts/navigation-blocker-context'

type ConfirmModalProps = {
  condition?: boolean
  title?: string
  text?: string
  confirmLabel?: string
  cancelLabel?: string
}

export const ConfirmModal = ({
  condition = false,
  title,
  text,
  confirmLabel,
  cancelLabel,
}: ConfirmModalProps) => {
  const t = useTranslations('components.confirmModal')

  const router = useRouter()
  const pathname = usePathname()
  const lastLocationRef = useRef<string | null>(null)

  const { isBlocked, setIsBlocked, pendingRoute, setPendingRoute } =
    useNavigationBlocker()

  const handleProceed = () => {
    if (pendingRoute) {
      setIsBlocked(false)
      setPendingRoute(null)

      setTimeout(() => {
        if (pendingRoute === lastLocationRef.current) {
          router.back()
        } else {
          router.push(pendingRoute)
        }
      }, 300)
    }
  }

  const handleCancel = () => {
    setPendingRoute(null)
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isBlocked) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () =>
      void window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isBlocked])

  useEffect(() => {
    const handleBackButton = () => {
      if (isBlocked) {
        history.pushState(null, '', window.location.href)

        const previousURL = lastLocationRef.current || document.referrer || '/'
        setPendingRoute(previousURL)
      }
    }

    window.addEventListener('popstate', handleBackButton)

    return () => void window.removeEventListener('popstate', handleBackButton)
  }, [isBlocked, pathname, router, setPendingRoute])

  useEffect(() => {
    lastLocationRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (isBlocked) {
      history.pushState(null, '', window.location.href)

      return () => {
        history.back()
      }
    }
  }, [isBlocked])

  useEffect(() => {
    if (condition) {
      setIsBlocked(true)
    }

    return () => {
      setIsBlocked(false)
    }
  }, [condition, setIsBlocked])

  return (
    <DefaultModal
      showModal={!!pendingRoute}
      closeModal={handleCancel}
      modalSize="2xl"
    >
      <h3 className="mb-4 text-xl font-bold">{title ?? t('title')}</h3>
      <p>{text ?? t('text')}</p>
      <div className="mt-6 flex justify-between gap-6 border-t border-gray-200 pt-6">
        <ButtonTw
          onClick={handleCancel}
          type="button"
          className="flex-auto"
          secondary
        >
          {cancelLabel ?? t('button.cancel')}
        </ButtonTw>
        <ButtonTw onClick={handleProceed} type="button" className="flex-auto">
          {confirmLabel ?? t('button.submit')}
        </ButtonTw>
      </div>
    </DefaultModal>
  )
}
