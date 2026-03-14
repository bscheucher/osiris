'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { getUser } from '@/lib/utils/api-utils'
import { executeGET, executePATCH } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'
import FileModal from '@/components/molecules/file-modal'
import { Abwesenheit, AbwesenheitsbestaetigungStatus, AbwesenheitTable, } from './abwesenheit-table'
import { AbwesenheitDetails } from './abwesenheit-details'
import { AbwesenheitRejectModal } from './abwesenheit-reject-modal'
import TooltipTw from '@/components/atoms/tooltip-tw'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

export default function Page() {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const [abwesenheiten, setAbwesenheiten] = useState<Abwesenheit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Abwesenheit | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectEntryId, setRejectEntryId] = useState<number | null>(null)

  const handleView = (entry: Abwesenheit) => {
    setSelectedEntry(entry)
    setShowModal(true)
  }

  const loadData = useCallback(async () => {
    try {
      const user = await getUser()

      if (!user?.email) {
        console.warn('User email is missing from session cookie')
      }

      const response = await executeGET<{ abwesenheiten: Abwesenheit[] }>(
        `/tn-portal/abwesenheitsbestaetigungen?email=${user?.email}`
      )

      if (response.data?.abwesenheiten) {
        setAbwesenheiten(
          response.data.abwesenheiten.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        )
      }
    } catch (error) {
      showError(t('error.laden'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData().then()
  }, [loadData])

  const handleApprove = async (id: number) => {
    try {
      await executePATCH(`/tn-portal/abwesenheitsbestaetigungen/${id}/approve`)
      showSuccess(t('success.approve'))
      setShowModal(false)
      await loadData()
    } catch (error) {
      showError(t('error.approve'))
    }
  }

  const handleReject = (id: number) => {
    setRejectEntryId(id)
    setShowRejectModal(true)
  }

  const handleRejectSuccess = async () => {
    setShowModal(false)
    await loadData()
  }

  const actionButtons = selectedEntry ? (
    <div className="flex justify-center gap-6">
      <TooltipTw content={t('actions.approve')}>
        <button
          onClick={() => handleApprove(selectedEntry.id)}
          disabled={selectedEntry.status !== AbwesenheitsbestaetigungStatus.NEW}
          className="cursor-pointer font-semibold text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <CheckIcon className="h-8 w-8" />
        </button>
      </TooltipTw>
      <TooltipTw content={t('actions.reject')}>
        <button
          onClick={() => handleReject(selectedEntry.id)}
          disabled={selectedEntry.status !== AbwesenheitsbestaetigungStatus.NEW}
          className="cursor-pointer font-semibold text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>
      </TooltipTw>
    </div>
  ) : null

  return (
    <LayoutWrapper title={t('title')} className="max-w-7xl">
      <AbwesenheitTable
        abwesenheiten={abwesenheiten}
        isLoading={isLoading}
        onView={handleView}
      />
      {selectedEntry && (
        <FileModal
          title={t('table.dokument')}
          downloadUrl={`/tn-portal/abwesenheitsbestaetigungen/${selectedEntry.id}/file`}
          mimeType="application/pdf"
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          testId="abwesenheit-file-modal"
        >
          <div className="flex w-full flex-col">
            <AbwesenheitDetails entry={selectedEntry} />
            <div className="flex items-center justify-center gap-10 border-t border-gray-100 pt-4">
              {actionButtons}
            </div>
          </div>
        </FileModal>
      )}
      <AbwesenheitRejectModal
        showModal={showRejectModal}
        closeModal={() => setShowRejectModal(false)}
        onSuccess={handleRejectSuccess}
        entryId={rejectEntryId}
      />
    </LayoutWrapper>
  )
}
