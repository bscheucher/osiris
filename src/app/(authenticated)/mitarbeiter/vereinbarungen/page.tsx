'use client'

import { LinkIcon, PlusIcon } from '@heroicons/react/20/solid'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import VereinbarungenSearchForm from './vereinbarungen-search-form'
import {
  DOKUMENT_SPEICHERN_WFI_ID,
  VEREINBARUNG_EDIT_WFI_ID,
  VereinbarungEntry,
} from './vereinbarungen-utils'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import ButtonTw from '@/components/atoms/button-tw'
import Loader from '@/components/atoms/loader'
import TooltipTw from '@/components/atoms/tooltip-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { WorkflowStatusBadge } from '@/components/molecules/workflow-status-badge-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const PAGE_SIZE = 10

export default function Page() {
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalResults, setTotalResults] = useState<number>(0)

  const [vereinbarungenList, setVereinbarungenList] = useState<
    VereinbarungEntry[]
  >([])
  const t = useTranslations('mitarbeiterVereinbarungen.overview')
  const { hasSomeRole } = useUserStore()

  useAsyncEffect(async () => {
    setIsLoading(true)
    const { searchParamsObject } = getSearchParamsObject(searchParams)

    const searchParamsPage = searchParams.get('page')
      ? parseInt(searchParams.get('page') as string)
      : 1

    try {
      const { data, pagination } = await executeGET<{
        vereinbarungen: VereinbarungEntry[]
      }>(
        `/vereinbarung/search${toQueryString({
          ...searchParamsObject,
          page: searchParamsPage - 1,
          size: PAGE_SIZE,
        })}`
      )

      if (data?.vereinbarungen) {
        setVereinbarungenList(data.vereinbarungen)
        setTotalResults(pagination.totalCount)
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label.vereinbarungen')}
      button={
        <ButtonTw
          href="/mitarbeiter/vereinbarungen/anlegen"
          className="flex h-12 items-center gap-1"
          hidden={
            !hasSomeRole([
              ROLE.MA_VEREINBARUNGEN_ERSTELLEN,
              ROLE.MA_UNEINGESCHRAENKTE_VEREINBARUNGEN_ERSTELLEN,
            ])
          }
        >
          <PlusIcon className="h-6 w-6" />
          {t('label.vereinbarungErstellen')}
        </ButtonTw>
      }
    >
      <>
        <VereinbarungenSearchForm />
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
          ) : vereinbarungenList.length ? (
            <TableTw className="flex-auto" testId="mitarbeiter-table">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw sortId={'name'}>
                    {t('table.name')}
                  </TableHeaderTw>
                  <TableHeaderTw
                    sortId={'gueltigAb'}
                    className="whitespace-nowrap"
                  >
                    {t('table.gueltigAb')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'title'}>
                    {t('table.title')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'status'}>
                    {t('table.status')}
                  </TableHeaderTw>
                  {/* <TableHeaderTw>{t('table.step')}</TableHeaderTw> */}
                  {hasSomeRole([
                    ROLE.MA_VEREINBARUNGEN_ERSTELLEN ||
                      ROLE.MA_UNEINGESCHRAENKTE_VEREINBARUNGEN_ERSTELLEN,
                  ]) && (
                    <TableHeaderTw className="text-right">
                      {t('table.bearbeiten')}
                    </TableHeaderTw>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vereinbarungenList.map((vereinbarung) => (
                  <tr key={vereinbarung.id}>
                    <TableCellTw>{`${vereinbarung.vorname} ${vereinbarung.nachname}`}</TableCellTw>
                    <TableCellTw>
                      {dayjs(vereinbarung.gueltigAb).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw>
                      <div className="flex items-center gap-4">
                        <span className="block">
                          {vereinbarung.vereinbarungName}
                        </span>
                        {vereinbarung.workflowItem.referenceWorkflowItemId ===
                          DOKUMENT_SPEICHERN_WFI_ID && (
                          <ButtonTw
                            href={`/mitarbeiter/vereinbarungen/${vereinbarung.id}?wfi=${vereinbarung.workflowItem.referenceWorkflowItemId}`}
                            secondary
                          >
                            <DocumentTextIcon className="size-5" />
                          </ButtonTw>
                        )}
                      </div>
                    </TableCellTw>
                    <TableCellTw className="whitespace-nowrap">
                      <TooltipTw
                        content={vereinbarung.workflowItem.workflowItemName}
                      >
                        <WorkflowStatusBadge
                          className="inline-block max-w-64 truncate"
                          workflowItem={vereinbarung.workflowItem}
                        />
                      </TooltipTw>
                    </TableCellTw>
                    {hasSomeRole([
                      ROLE.MA_VEREINBARUNGEN_ERSTELLEN ||
                        ROLE.MA_UNEINGESCHRAENKTE_VEREINBARUNGEN_ERSTELLEN,
                    ]) && (
                      <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                        <BlockingAwareLink
                          href={`/mitarbeiter/vereinbarungen/${vereinbarung.id}?wfi=${vereinbarung.workflowItem.referenceWorkflowItemId || VEREINBARUNG_EDIT_WFI_ID}`}
                          className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row justify-end gap-2 hover:underline"
                        >
                          <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                          {t('table.bearbeiten')}
                        </BlockingAwareLink>
                      </TableCellTw>
                    )}
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
      </>
    </LayoutWrapper>
  )
}
