'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import { QuestionMarkCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import AbwesenheitRefreshButton from './abwesenheit-refresh-button'
import AbwesenheitenSearchForm, {
  AbwesenheitenFormInputs,
} from '@/app/(authenticated)/mein-bereich/meine-abwesenheiten/abwesenheiten-search-form'
import ButtonTw from '@/components/atoms/button-tw'
import Loader from '@/components/atoms/loader'
import TooltipTw from '@/components/atoms/tooltip-tw'
import AbwesenheitStatusBadge from '@/components/molecules/abwesenheit-status-badge'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import {
  AbwesenheitEntry,
  AbwesenheitStatus,
  AbwesenheitType,
  getMessageFromStatusCode,
  SortDirection,
} from '@/lib/utils/abwesenheit-utils'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import {
  executeDELETE,
  executeGET,
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
  const t = useTranslations('meineAbwesenheiten.overview')
  const searchParams = useSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const [totalResults, setTotalResults] = useState(0)
  const [abwesenheitList, setAbwesenheitList] = useState<AbwesenheitEntry[]>([])
  const [abwesenheitenYearList, setAbwesenheitenYearList] = useState<string[]>(
    []
  )
  const { hasSomeRole } = useUserStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAbwesenheit, setSelectedAbwesenheit] =
    useState<AbwesenheitEntry | null>(null)

  const loadAbwesenheitList = useCallback(
    async (searchParamsObject: Partial<AbwesenheitenFormInputs>) => {
      setIsLoading(true)
      try {
        const searchParamsPage = searchParams.get('page')
          ? parseInt(searchParams.get('page') as string)
          : 1
        const queryParams = {
          ...searchParamsObject,
          page: (searchParamsPage - 1).toString(),
          size: PAGE_SIZE.toString(),
          sortProperty: searchParams.get('sortProperty') || undefined,
          sortDirection:
            (searchParams.get('sortDirection') as SortDirection) || undefined,
          isPersonal: true,
        }
        const response = await executeGET<{
          abwesenheit: AbwesenheitEntry[]
          abwesenheitenYearList: string[]
        }>(`/zeiterfassung/abwesenheiten/list${toQueryString(queryParams)}`)

        if (response.data?.abwesenheit) {
          setAbwesenheitList(response.data.abwesenheit)
        }
        if (response.data?.abwesenheitenYearList) {
          setAbwesenheitenYearList(response.data.abwesenheitenYearList)
        }

        if (response.pagination) {
          setTotalResults(response.pagination.totalCount)
        }
      } catch (error) {
        showError(t('error.laden'))
      } finally {
        setIsLoading(false)
      }
    },
    [t, searchParams]
  )

  useAsyncEffect(() => {
    loadAbwesenheitList(searchParamsObject)
  }, [searchParams])

  const openDeleteModal = async (entry: AbwesenheitEntry) => {
    setSelectedAbwesenheit(entry)
    setShowDeleteModal(true)
  }

  const closeModal = () => {
    setShowDeleteModal(false)
    setSelectedAbwesenheit(null)
  }

  const deleteAbwesenheit = async () => {
    if (!selectedAbwesenheit?.id) {
      showError(t('delete.message.error'))
      return
    }
    setIsDeleteLoading(true)
    try {
      const response = await executeDELETE<{
        abwesenheit: AbwesenheitEntry[]
      }>(`/zeiterfassung/abwesenheiten/delete/${selectedAbwesenheit.id}`)

      if (response.success) {
        showSuccess(t('delete.message.success'))
        await loadAbwesenheitList(searchParamsObject)
      } else {
        showError(t('delete.message.error'))
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsDeleteLoading(false)
      closeModal()
    }
  }

  return (
    <>
      <LayoutWrapper
        title={t('label')}
        className="max-w-4xl lg:max-w-7xl"
        button={
          <ButtonTw
            href="/mein-bereich/meine-abwesenheiten/anlegen"
            className="flex h-12 items-center gap-1"
            hidden={!hasSomeRole(ROLE.AB_ABWESENHEITEN_EDITIEREN)}
          >
            <PlusIcon className="h-6 w-6" />
            {t('create')}
          </ButtonTw>
        }
      >
        <AbwesenheitenSearchForm
          yearOptions={abwesenheitenYearList}
          isLoading={isLoading}
        />
        <div className="flex min-h-48 items-center justify-center py-8">
          {isLoading ? (
            <div
              className={twMerge(
                'block',
                totalResults > PAGE_SIZE && !isLoading
                  ? 'h-[1400px]'
                  : 'min-h-12'
              )}
            >
              <Loader />
            </div>
          ) : abwesenheitList.length ? (
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw sortId={'changedOn'}>
                    {t('table.zuletztGeaendert')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'startDate'}>
                    {t('table.zeitraum')}
                  </TableHeaderTw>
                  <TableHeaderTw
                    className="whitespace-nowrap"
                    sortId={'durationInDays'}
                  >
                    {t('table.dauerInTagenPrefix')}
                    <br />
                    {t('table.dauerInTagenSuffix')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'type'}>
                    {t('table.kategorie')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'status'}>
                    {t('table.status')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'comment'}>
                    {t('table.mitarbeiterBemerkung')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'commentFuehrungskraft'}>
                    {t('table.fuehrungskraftBemerkung')}
                  </TableHeaderTw>
                  <TableHeaderTw>{t('table.aktion')}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {abwesenheitList.map((entry) => (
                  <tr key={entry.id}>
                    <TableCellTw>
                      {dayjs(entry.changedOn).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw>{`${dayjs(entry.startDate).format('DD.MM.YYYY')} - ${dayjs(entry.endDate).format('DD.MM.YYYY')}`}</TableCellTw>
                    <TableCellTw>
                      <div className="flex items-center gap-1">
                        {entry.durationInDays}
                        {!entry.lhrCalculated && (
                          <TooltipTw content={t('table.lhrCalculated.tooltip')}>
                            <QuestionMarkCircleIcon className="text-ibis-blue size-4 cursor-help" />
                          </TooltipTw>
                        )}
                      </div>
                    </TableCellTw>
                    <TableCellTw>
                      {entry.type === AbwesenheitType.URLAU
                        ? t('abwesenheitstyp.urlaub')
                        : t('abwesenheitstyp.zeitausgleich')}
                    </TableCellTw>
                    <TableCellTw className="whitespace-nowrap">
                      {entry.status === AbwesenheitStatus.INVALID ? (
                        <TooltipTw
                          className="block"
                          content={getMessageFromStatusCode(
                            entry.lhrHttpStatus,
                            t
                          )}
                        >
                          <AbwesenheitStatusBadge status={entry.status} />
                        </TooltipTw>
                      ) : (
                        <AbwesenheitStatusBadge status={entry.status} />
                      )}
                    </TableCellTw>
                    <TableCellTw>{entry.comment}</TableCellTw>
                    <TableCellTw>{entry.commentFuehrungskraft}</TableCellTw>
                    <TableCellTw className="flex justify-center px-3 py-4">
                      {entry.status === AbwesenheitStatus.ACCEPTED && (
                        <ButtonTw
                          className="bg-red-600 ring-red-700 hover:bg-red-500"
                          testId="abwesenheit-delete-button"
                          onClick={() => openDeleteModal(entry)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </ButtonTw>
                      )}
                      {entry.status === AbwesenheitStatus.INVALID && (
                        <AbwesenheitRefreshButton abwesenheit={entry} />
                      )}
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
          ) : (
            <div className="block">
              <p>{t('table.noData')}</p>
            </div>
          )}
        </div>
        <PaginationSimpleTw pageSize={PAGE_SIZE} totalResults={totalResults} />
      </LayoutWrapper>
      {selectedAbwesenheit && (
        <DefaultModal
          showModal={showDeleteModal}
          closeModal={closeModal}
          modalSize="xl"
          testId="abwesenheitDelete-modal"
        >
          <div className="sm:flex sm:items-start">
            <div className="mt-3 sm:mt-0 sm:text-left">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('delete.modal.title')}
              </h3>
              <div className="mt-4 text-gray-600">
                <div className="space-y-4">{t('delete.modal.text')}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 sm:mt-8 sm:pt-6">
            <ButtonTw
              onClick={() => closeModal()}
              className="bg-white text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              isLoading={isDeleteLoading}
            >
              {t('delete.modal.cancel')}
            </ButtonTw>
            <ButtonTw
              onClick={() => deleteAbwesenheit()}
              className="w-16"
              isLoading={isDeleteLoading}
            >
              {t('delete.modal.submit')}
            </ButtonTw>
          </div>
        </DefaultModal>
      )}
    </>
  )
}
