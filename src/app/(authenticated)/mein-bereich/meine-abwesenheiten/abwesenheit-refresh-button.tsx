import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import { AbwesenheitEntry } from '@/lib/utils/abwesenheit-utils'
import { executePOST } from '@/lib/utils/gateway-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'

export interface Props {
  abwesenheit: AbwesenheitEntry
}

export const showMessageFromStatusCode = (
  errorCode: number,
  t: (key: string) => string
) => {
  switch (errorCode) {
    case 200:
      showSuccess(t('notification.refreshSuccessful'))
      break
    case 409:
      showError(t('notification.conflict'))
      break
    case 405:
      showError(t('notification.invalidData'))
      break
    default:
      showError(t('notification.internalServerError'))
  }
}

const AbwesenheitRefreshButton = ({ abwesenheit, ...rest }: Props) => {
  const t = useTranslations('meineAbwesenheiten.overview')

  const [isLoading, setIsLoading] = useState(false)

  const handleOnClick = async () => {
    if (!abwesenheit?.id) {
      return
    }

    setIsLoading(true)
    try {
      const { data } = await executePOST<{
        abwesenheit: AbwesenheitEntry[]
      }>(`/zeiterfassung/abwesenheiten/${abwesenheit.id}`)

      const lhrStatus = data?.abwesenheit[0].lhrHttpStatus

      if (lhrStatus) {
        showMessageFromStatusCode(lhrStatus, t)
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ButtonTw
      testId="abwesenheit-refresh-button"
      isLoading={isLoading}
      onClick={handleOnClick}
      {...rest}
    >
      <ArrowPathIcon className="h-4 w-4" />
    </ButtonTw>
  )
}

export default AbwesenheitRefreshButton
