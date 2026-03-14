'use client'

import { LinkIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import {
  VertragsaenderungsEntry,
  VertragsaenderungsStatus,
} from '../vereinbarungen/vereinbarungen-utils'
import VertragsaenderungenSearchForm from '@/app/(authenticated)/mitarbeiter/vertragsaenderungen/vertragsaenderungen-search-form'
import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import Loader from '@/components/atoms/loader'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'

const PAGE_SIZE = 10

const getStatusBadge = (
  t: (key: string) => string,
  status: VertragsaenderungsStatus
) => {
  switch (status) {
    case VertragsaenderungsStatus.NEW:
    case VertragsaenderungsStatus.IN_PROGRESS:
      return (
        <BadgeTw color={BadgeColor.Yellow} className="w-full justify-center">
          {t(`vertragsaenderungsstatus.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case VertragsaenderungsStatus.CANCELED:
    case VertragsaenderungsStatus.ERROR:
      return (
        <BadgeTw color={BadgeColor.Red} className="w-full justify-center">
          {t(`vertragsaenderungsstatus.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case VertragsaenderungsStatus.CLOSED:
      return (
        <BadgeTw color={BadgeColor.Green} className="w-full justify-center">
          {t(`vertragsaenderungsstatus.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    default:
      return (
        <BadgeTw color={BadgeColor.Gray} className="w-full justify-center">
          {t('vertragsaenderungsstatus.noStatus')}
        </BadgeTw>
      )
  }
}

export default function Page() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [vertragsaenderungsList, setVertragsaenderungsList] = useState<
    VertragsaenderungsEntry[]
  >([])
  const t = useTranslations('mitarbeiterVertragsaenderungen.overview')

  useAsyncEffect(async () => {
    setIsLoading(true)
    const { searchParamsObject } = getSearchParamsObject(searchParams)

    const searchParamsPage = searchParams.get('page')
      ? parseInt(searchParams.get('page') as string)
      : 1

    try {
      // create a custom category status for OPEN
      const status =
        searchParamsObject.status === 'OPEN'
          ? 'CANCELED,CLOSED,ERROR,IN_PROGRESS,NEW'
          : searchParamsObject.status

      const queryParams = {
        page: (searchParamsPage - 1).toString(),
        size: PAGE_SIZE.toString(),
        searchTerm: searchParamsObject.searchTerm,
        statuses: [status],
      }

      const response = await executeGET<{
        vertragsenderungFiltered: VertragsaenderungsEntry[]
      }>(`/ma-verwalten/search-vertragaenderungen${toQueryString(queryParams)}`)

      if (response.data?.vertragsenderungFiltered && response.pagination) {
        setVertragsaenderungsList(response.data.vertragsenderungFiltered)
        setTotalResults(response.pagination.totalCount)
      }
    } catch (e) {
      showError(t('error.laden'))
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('title')}
    >
      <>
        <VertragsaenderungenSearchForm isLoading={isLoading} />
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
          ) : vertragsaenderungsList.length ? (
            <TableTw className="flex-auto" testId="mitarbeiter-table">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw sortId={'nachname'}>
                    {t('table.nachname')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'vorname'}>
                    {t('table.vorname')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'svnr'}>
                    {t('table.svnr')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'gueltigAb'}>
                    {t('table.gueltigAb')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'kostenstelle'}>
                    {t('table.kostenstelle')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'status'}>
                    {t('table.status')}
                  </TableHeaderTw>
                  <TableHeaderTw sortId={'interneAnmerkung'}>
                    {t('table.interneAnmerkung')}
                  </TableHeaderTw>
                  <TableHeaderTw className="text-right">
                    {t('table.bearbeiten')}
                  </TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vertragsaenderungsList.map((vertragsaenderung) => (
                  <tr key={vertragsaenderung.id}>
                    <TableCellTw>{vertragsaenderung.nachname}</TableCellTw>
                    <TableCellTw>{vertragsaenderung.vorname}</TableCellTw>
                    <TableCellTw>{vertragsaenderung.svnr}</TableCellTw>
                    <TableCellTw>
                      {dayjs(vertragsaenderung.gueltigAb).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw>{vertragsaenderung.kostenstelle}</TableCellTw>
                    <TableCellTw className="whitespace-nowrap">
                      {getStatusBadge(t, vertragsaenderung.status)}
                    </TableCellTw>
                    <TableCellTw>
                      {vertragsaenderung.interneAnmerkung}
                    </TableCellTw>
                    <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                      <BlockingAwareLink
                        href={`/mitarbeiter/vertragsaenderungen/${vertragsaenderung.id}?wfi=43`}
                        className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row justify-end gap-2 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                        {t('table.bearbeiten')}
                      </BlockingAwareLink>
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
      </>
    </LayoutWrapper>
  )
}
