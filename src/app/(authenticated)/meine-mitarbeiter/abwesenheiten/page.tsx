'use client'

import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import AbwesenheitenGenehmigenSearchForm from './abwesenheiten-genehmigen-search-form'
import AbwesenheitGenehmigenModal, {
  AbwesenheitGenehmigenFormValues,
} from '@/app/(authenticated)/meine-mitarbeiter/abwesenheiten/abwesenheit-genehmigen-modal'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import AbwesenheitStatusBadge from '@/components/molecules/abwesenheit-status-badge'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import {
  AbwesenheitEntry,
  AbwesenheitStatus,
  AbwesenheitType,
} from '@/lib/utils/abwesenheit-utils'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import {
  executeGET,
  executePOST,
  toQueryString,
} from '@/lib/utils/gateway-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const PAGE_SIZE = 10

export default function Page() {
  const t = useTranslations('abwesenheitenGenehmigen')
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [abwesenheitList, setAbwesenheitList] = useState<AbwesenheitEntry[]>([])
  const { hasSomeRole } = useUserStore()
  const [showGenehmigenModal, setShowGenehmigenModal] = useState(false)
  const [isGenehmigenModalLoading, setIsGenehmigenModalLoading] =
    useState(false)
  const [selectedAbwesenheit, setSelectedAbwesenheit] =
    useState<AbwesenheitEntry | null>(null)

  const openGenehmigenModal = async (entry: AbwesenheitEntry) => {
    setSelectedAbwesenheit(entry)
    setShowGenehmigenModal(true)
  }

  const handleAbwesenheitsAntrag = async (
    data: AbwesenheitGenehmigenFormValues
  ) => {
    if (!selectedAbwesenheit?.id) {
      showError(t('error.laden.abwesenheit'))
      return
    }
    setIsGenehmigenModalLoading(true)
    try {
      await executePOST<{ abwesenheit: AbwesenheitEntry[] }>(
        `/zeiterfassung/abwesenheiten/genehmigung/${selectedAbwesenheit.id}`,
        data
      )
      showSuccess(t('message.success.approved'))
      await loadAbwesenheitList()
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsGenehmigenModalLoading(false)
      closeModal()
    }
  }

  const closeModal = () => {
    setShowGenehmigenModal(false)
    setSelectedAbwesenheit(null)
  }

  const loadAbwesenheitList = useCallback(async () => {
    setIsLoading(true)
    const { searchParamsObject } = getSearchParamsObject(searchParams)

    try {
      const searchParamsPage = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1

      const queryParams = {
        ...searchParamsObject,
        page: searchParamsPage - 1,
        size: PAGE_SIZE,
        isPersonal: false,
      }

      const response = await executeGET<{
        abwesenheit: AbwesenheitEntry[]
      }>(`/zeiterfassung/abwesenheiten/list${toQueryString(queryParams)}`)

      if (response.data?.abwesenheit) {
        setAbwesenheitList(response.data.abwesenheit)
      }

      if (response.pagination) {
        setTotalResults(response.pagination.totalCount)
      }
    } catch (error) {
      showError(t('error.laden.abwesenheiten'))
    } finally {
      setIsLoading(false)
    }
  }, [t, searchParams])

  useAsyncEffect(loadAbwesenheitList, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label')}
    >
      <AbwesenheitenGenehmigenSearchForm isLoading={isLoading} />
      {isLoading ? (
        <div className="flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        <>
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw sortId={'fullName'}>
                  {t('table.fullName')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'changedOn'}>
                  {t('table.zuletztGeaendert')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'startDate'}>
                  {t('table.zeitraum')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'durationInDays'}>
                  {t('table.dauerInTagen')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'type'}>
                  {t('table.kategorie')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'status'}>
                  {t('table.status')}
                </TableHeaderTw>
                <TableHeaderTw sortId={'comment'}>
                  {t('table.bemerkung')}
                </TableHeaderTw>
                <>
                  {hasSomeRole(ROLE.AB_ABWESENHEITEN_GENEHMIGEN) ? (
                    <TableHeaderTw>{t('table.genehmigen')}</TableHeaderTw>
                  ) : null}
                </>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {abwesenheitList.map((entry) => (
                <tr key={entry.id}>
                  <TableCellTw>{entry.fullName}</TableCellTw>
                  <TableCellTw>
                    {dayjs(entry.changedOn).format('DD.MM.YYYY')}
                  </TableCellTw>
                  <TableCellTw>{`${dayjs(entry.startDate).format('DD.MM.YYYY')} - ${dayjs(entry.endDate).format('DD.MM.YYYY')}`}</TableCellTw>
                  <TableCellTw>{entry.durationInDays}</TableCellTw>
                  <TableCellTw>
                    {entry.type === AbwesenheitType.URLAU
                      ? t('abwesenheitstyp.urlaub')
                      : t('abwesenheitstyp.zeitausgleich')}
                  </TableCellTw>
                  <TableCellTw className="whitespace-nowrap">
                    <AbwesenheitStatusBadge status={entry.status} />
                  </TableCellTw>
                  <TableCellTw>{entry.comment}</TableCellTw>
                  {hasSomeRole(ROLE.AB_ABWESENHEITEN_GENEHMIGEN) ? (
                    <TableCellTw className="flex justify-center px-3 py-4">
                      <ButtonTw
                        onClick={() => openGenehmigenModal(entry)}
                        className="flex flex-row gap-2 hover:underline"
                        disabled={[
                          AbwesenheitStatus.ACCEPTED,
                          AbwesenheitStatus.ACCEPTED_FINAL,
                          AbwesenheitStatus.REJECTED,
                          AbwesenheitStatus.CANCELED,
                          AbwesenheitStatus.USED,
                        ].includes(entry.status)}
                      >
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                      </ButtonTw>
                    </TableCellTw>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </TableTw>
          <PaginationSimpleTw
            pageSize={PAGE_SIZE}
            totalResults={totalResults}
          />
          {selectedAbwesenheit && (
            <div className="mt-8">
              <AbwesenheitGenehmigenModal
                showModal={showGenehmigenModal}
                closeModal={() => closeModal()}
                onSave={handleAbwesenheitsAntrag}
                abwesenheitData={selectedAbwesenheit}
                isLoading={isGenehmigenModalLoading}
              />
            </div>
          )}
        </>
      )}
    </LayoutWrapper>
  )
}
