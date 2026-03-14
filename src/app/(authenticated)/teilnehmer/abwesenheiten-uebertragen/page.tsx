'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import TooltipTw, { TooltipDirection } from '@/components/atoms/tooltip-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationTw from '@/components/molecules/pagination-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import {
  ZeiterfassungUebermittlung,
  ZeiterfassungUebermittlungStatus,
} from '@/lib/utils/abwesenheit-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

const PAGE_SIZE = 10

const getStatusBadge = (
  status: `${ZeiterfassungUebermittlungStatus}`,
  title: string
) => {
  switch (status) {
    case ZeiterfassungUebermittlungStatus.NEW:
    case ZeiterfassungUebermittlungStatus.IN_PROGRESS:
    case ZeiterfassungUebermittlungStatus.PARTIALLY_COMPLETED:
      return (
        <BadgeTw
          className="flex w-full justify-center"
          color={BadgeColor.Yellow}
        >
          {title}
        </BadgeTw>
      )

    case ZeiterfassungUebermittlungStatus.COMPLETED:
    case ZeiterfassungUebermittlungStatus.VALID:
      return (
        <BadgeTw
          className="flex w-full justify-center"
          color={BadgeColor.Green}
        >
          {title}
        </BadgeTw>
      )

    case ZeiterfassungUebermittlungStatus.CANCELED:
    case ZeiterfassungUebermittlungStatus.REJECTED:
    case ZeiterfassungUebermittlungStatus.ERROR:
    case ZeiterfassungUebermittlungStatus.INVALID:
      return (
        <BadgeTw className="flex w-full justify-center" color={BadgeColor.Red}>
          {title}
        </BadgeTw>
      )

    default:
      return (
        <BadgeTw className="flex w-full justify-center" color={BadgeColor.Red}>
          Fehler
        </BadgeTw>
      )
  }
}

export default function Page() {
  const t = useTranslations('abwesenheitenUebertragen.overview')
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const [totalResults, setTotalResults] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [anwesenheitList, setAnwesenheitList] = useState<
    ZeiterfassungUebermittlung[]
  >([])

  useAsyncEffect(async () => {
    setIsLoading(true)
    try {
      const queryParams = {
        page: (page - 1).toString(),
        size: PAGE_SIZE.toString(),
      }
      const response = await executeGET<{
        zeiterfassungTransferList: ZeiterfassungUebermittlung[]
      }>(
        `/teilnehmer/getZeiterfassungUebermittlungen${toQueryString(queryParams)}`
      )
      if (response.data?.zeiterfassungTransferList) {
        setAnwesenheitList(response.data.zeiterfassungTransferList)
      }

      if (response.pagination) {
        setTotalResults(response.pagination.totalCount)
      }
    } catch (e) {
      showErrorMessage(e)
    }

    setIsLoading(false)
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label')}
      button={
        <ButtonTw
          href="/teilnehmer/abwesenheiten-uebertragen/neu"
          className="flex h-12 items-center gap-1"
        >
          <PlusIcon className="h-6 w-6" />
          {t('create')}
        </ButtonTw>
      }
    >
      <>
        {isLoading || !anwesenheitList ? (
          <div className="flex h-[760px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <>
            <h2 className="mb-4 block text-2xl font-semibold tracking-tight text-gray-800">
              {t('overviewLabel')}
            </h2>
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t('table.header.user')}</TableHeaderTw>
                  <TableHeaderTw>{t('table.header.timeFrame')}</TableHeaderTw>
                  <TableHeaderTw>{t('table.header.lastChanged')}</TableHeaderTw>
                  <TableHeaderTw>{t('table.header.seminars')}</TableHeaderTw>
                  <TableHeaderTw>{t('table.header.status')}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {anwesenheitList.map((entry, index) => (
                  <tr key={index}>
                    <TableCellTw>{entry.userName}</TableCellTw>
                    <TableCellTw>{`${entry.datumVon ? dayjs(entry.datumVon).format('DD.MM.YYYY') : ''} - ${entry.datumBis ? dayjs(entry.datumBis).format('DD.MM.YYYY') : ''}`}</TableCellTw>
                    <TableCellTw>
                      {entry.datumSent
                        ? dayjs(entry.datumSent).format('DD.MM.YYYY, HH:mm:ss')
                        : '-'}
                    </TableCellTw>
                    <TableCellTw>
                      <TooltipTw
                        content={
                          <div className="break-normal">
                            <ul className="leading-loose">
                              {entry.seminars?.length
                                ? entry.seminars.map((seminar, index) => (
                                    <li key={index}>
                                      {seminar.seminarBezeichnung}
                                    </li>
                                  ))
                                : null}
                            </ul>
                          </div>
                        }
                        direction={TooltipDirection.Top}
                      >
                        <div className="max-w-20 cursor-pointer truncate">
                          {entry.seminars
                            ? entry.seminars
                                .map((seminar) => seminar.seminarBezeichnung)
                                .join(', ')
                            : null}
                        </div>
                      </TooltipTw>
                    </TableCellTw>
                    <TableCellTw>
                      {getStatusBadge(
                        entry.status,
                        t(`table.status.${entry.status.toLowerCase()}`)
                      )}
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
            <PaginationTw pageSize={PAGE_SIZE} totalResults={totalResults} />
          </>
        )}
      </>
    </LayoutWrapper>
  )
}
