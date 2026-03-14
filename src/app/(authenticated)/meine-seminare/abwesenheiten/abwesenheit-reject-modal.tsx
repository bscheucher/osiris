'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { DefaultModal } from '@/components/organisms/default-modal'
import ButtonTw from '@/components/atoms/button-tw'
import { executePATCH, toQueryString } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'

interface AbwesenheitRejectModalProps {
  showModal: boolean
  closeModal: () => void
  onSuccess: () => Promise<void>
  entryId: number | null
}

export const AbwesenheitRejectModal: React.FC<AbwesenheitRejectModalProps> = ({
  showModal,
  closeModal,
  onSuccess,
  entryId,
}) => {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const [rejectNote, setRejectNote] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    if (showModal) {
      setRejectNote('')
    }
  }, [showModal])

  const handleConfirm = async () => {
    if (entryId === null) return

    setIsRejecting(true)
    try {
      await executePATCH(
        `/tn-portal/abwesenheitsbestaetigungen/${entryId}/reject${toQueryString({ note: rejectNote })}`
      )
      showSuccess(t('success.reject'))
      await onSuccess()
      closeModal()
    } catch (error) {
      showError(t('error.reject'))
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <DefaultModal
      showModal={showModal}
      closeModal={closeModal}
      modalSize="4xl"
      testId="abwesenheit-reject-modal"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('rejectModal.title')}
        </h3>
        <p className="text-sm text-gray-500">{t('rejectModal.description')}</p>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="rejectNote"
            className="text-sm font-medium text-gray-700"
          >
            {t('rejectModal.noteLabel')}
          </label>
          <textarea
            id="rejectNote"
            rows={3}
            className="focus:ring-ibis-blue block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <ButtonTw secondary onClick={closeModal}>
            {t('rejectModal.cancel')}
          </ButtonTw>
          <ButtonTw
            className="bg-red-600 ring-red-600 hover:bg-red-700 focus-visible:outline-red-600"
            onClick={handleConfirm}
            isLoading={isRejecting}
          >
            {t('rejectModal.confirm')}
          </ButtonTw>
        </div>
      </div>
    </DefaultModal>
  )
}
