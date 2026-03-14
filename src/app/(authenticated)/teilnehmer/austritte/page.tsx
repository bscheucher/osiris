'use client'

import { LinkIcon, PlusIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Austritt, AustrittStatus } from '@/lib/utils/austritte-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'

const PAGE_SIZE = 25

const getStatusBadge = (t: (key: string) => string, status: AustrittStatus) => {
  switch (status) {
    case AustrittStatus.ABMELDUNG_BEI_LV:
      return (
        <BadgeTw color={BadgeColor.Yellow} className="w-full justify-center">
          {t('status.abmeldung')}
        </BadgeTw>
      )
    case AustrittStatus.ABGEMELDET:
      return (
        <BadgeTw color={BadgeColor.Green} className="w-full justify-center">
          {t('status.abgemeldet')}
        </BadgeTw>
      )
    case AustrittStatus.ERROR:
      return (
        <BadgeTw color={BadgeColor.Red} className="w-full justify-center">
          {t('status.fehlerhaft')}
        </BadgeTw>
      )
    default:
      return (
        <BadgeTw color={BadgeColor.Gray} className="w-full justify-center">
          {t('status.noStatus')}
        </BadgeTw>
      )
  }
}

export default function Page() {
  const t = useTranslations('teilnehmerAustritte.overview')
  const searchParams = useSearchParams()
  const searchParamsPage = searchParams.get('page')
    ? parseInt(searchParams.get('page') as string)
    : 1
  const [isLoading, setIsLoading] = useState(true)
  const [austritteList, setAustritteList] = useState<Austritt[]>([])
  const [totalResults, setTotalResults] = useState(0)

  useAsyncEffect(async () => {
    try {
      const queryParams = {
        page: (searchParamsPage - 1).toString(),
        size: PAGE_SIZE.toString(),
      }
      const response = await executeGET<{
        uebaAbmeldungen: Austritt[]
      }>(`/teilnehmer/getUebaAbmeldung${toQueryString(queryParams)}`)

      if (response.data?.uebaAbmeldungen && response.pagination) {
        setAustritteList(response.data.uebaAbmeldungen)
        setTotalResults(response.pagination.totalCount)
      }
    } catch (error) {
      showError(t('error.laden'))
    }
    setIsLoading(false)
  }, [])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label')}
      button={
        <ButtonTw
          href="/teilnehmer/austritte/anlegen"
          className="flex h-12 items-center gap-1"
        >
          <PlusIcon className="h-6 w-6" />
          {t('create')}
        </ButtonTw>
      }
    >
      {isLoading ? (
        <div className="flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        <>
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw>{t('table.nachname')}</TableHeaderTw>
                <TableHeaderTw>{t('table.vorname')}</TableHeaderTw>
                <TableHeaderTw>{t('table.svnr')}</TableHeaderTw>
                <TableHeaderTw>{t('table.austritt')}</TableHeaderTw>
                <TableHeaderTw>{t('table.kostenstelle')}</TableHeaderTw>
                <TableHeaderTw>{t('table.status')}</TableHeaderTw>
                <TableHeaderTw>{t('table.bearbeiten')}</TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {austritteList.map((entry) => (
                <tr key={entry.id}>
                  <TableCellTw>{entry.nachname}</TableCellTw>
                  <TableCellTw>{entry.vorname}</TableCellTw>
                  <TableCellTw>{entry.svNummer}</TableCellTw>
                  <TableCellTw>{`${entry.austrittsDatum ? dayjs(entry.austrittsDatum).format('DD.MM.YYYY') : ''}`}</TableCellTw>
                  <TableCellTw>{entry.kostenstelle}</TableCellTw>
                  <TableCellTw>{getStatusBadge(t, entry.status)}</TableCellTw>
                  <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                    {entry.status !== AustrittStatus.ABGEMELDET && (
                      <BlockingAwareLink
                        href={`austritte/bearbeiten/${entry.id}`}
                        className="text-ibis-blue hover:text-ibis-blue-light flex flex-row gap-2 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                        {t('edit')}
                      </BlockingAwareLink>
                    )}
                  </TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
          <PaginationSimpleTw
            pageSize={PAGE_SIZE}
            totalResults={totalResults}
          />
        </>
      )}
    </LayoutWrapper>
  )
}
