'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useMemo, useState } from 'react'

import UrlaubskontoSearchForm from '@/app/(authenticated)/mein-bereich/urlaubskonto/urlaubskonto-search-form'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import TooltipTw, { TooltipDirection } from '@/components/atoms/tooltip-tw'
import AbwesenheitStatusBadge from '@/components/molecules/abwesenheit-status-badge'
import InfoSectionTw from '@/components/molecules/info-section-tw'
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
  SortDirection,
  UrlaubEntry,
  UrlaubOverview,
  UrlaubType,
} from '@/lib/utils/abwesenheit-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const PAGE_SIZE = 10

const createUrlaubStatistics = (
  t: (key: string) => string,
  urlaubData: UrlaubOverview | null
) => {
  if (!urlaubData) return []
  return [
    {
      name: t('kontoanzeige.nextAnspruch'),
      value: urlaubData?.nextAnspruch
        ? dayjs(urlaubData?.nextAnspruch).format('DD.MM.YYYY')
        : t('kontoanzeige.noData'),
    },
    {
      name: t('kontoanzeige.anspruch'),
      value:
        urlaubData?.verbraucht !== null
          ? urlaubData?.verbraucht
          : t('kontoanzeige.noData'),
    },
    {
      name: t('kontoanzeige.konsum'),
      value:
        urlaubData?.konsum !== null
          ? urlaubData?.konsum
          : t('kontoanzeige.noData'),
    },
    {
      name: t('kontoanzeige.rest'),
      value:
        urlaubData?.rest !== null ? urlaubData?.rest : t('kontoanzeige.noData'),
    },
  ]
}

export default function Page() {
  const t = useTranslations('urlaubsKonto.overview')
  const { hasSomeRole } = useUserStore()
  const searchParams = useSearchParams()
  const startDateParam = searchParams.get('startDate') || ''
  const endDateParam = searchParams.get('endDate') || ''

  const [totalResults, setTotalResults] = useState(0)
  const [urlaubData, setUrlaubData] = useState<UrlaubOverview | null>(null)
  const [urlaubList, setUrlaubList] = useState<UrlaubEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const urlaubStatistics = useMemo(
    () => createUrlaubStatistics(t, urlaubData),
    [t, urlaubData]
  )

  const loadUrlaubData = useCallback(async () => {
    setIsLoading(true)
    try {
      const searchParamsPage = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1

      const queryParams = {
        page: (searchParamsPage - 1).toString(),
        size: PAGE_SIZE.toString(),
        startDate: startDateParam,
        endDate: endDateParam,
        sortProperty: searchParams.get('sortProperty') || undefined,
        sortDirection:
          (searchParams.get('sortDirection') as SortDirection) || undefined,
      }

      const response = await executeGET<{
        urlaubOverview: UrlaubOverview[]
      }>(`/zeiterfassung/abwesenheiten/overview${toQueryString(queryParams)}`)

      const urlaubOverview = response.data?.urlaubOverview[0]
      const urlaube = urlaubOverview?.urlaube

      if (urlaubOverview && urlaube) {
        setUrlaubData(urlaubOverview)
        setUrlaubList(urlaube)
      }

      if (response.pagination) {
        setTotalResults(response.pagination.totalCount)
      }
    } catch (error) {
      showError(t('error.laden'))
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, startDateParam, endDateParam, t])

  useAsyncEffect(() => {
    loadUrlaubData()
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label.overview')}
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
      <>
        {urlaubData ? (
          <>
            <h2 className="mb-4 block text-xl font-semibold tracking-tight text-gray-800">
              {t('kontoanzeige.titel')}
            </h2>
            <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4">
              {urlaubStatistics.map((stat) => (
                <div
                  key={stat.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
                >
                  <dt className="text-sm leading-6 font-medium text-gray-500">
                    {stat.name}
                  </dt>
                  <dd className="w-full flex-none text-3xl leading-10 font-medium tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-4 mb-4 block text-xl font-semibold tracking-tight text-gray-800">
              {t('label.historie')}
            </h2>
            <InfoSectionTw
              description={t('label.historieInfo')}
              className="mb-4"
            />
            <UrlaubskontoSearchForm
              startDate={startDateParam}
              endDate={endDateParam}
              isLoading={isLoading}
            />
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoaderTw size={LoaderSize.XLarge} />
              </div>
            ) : urlaubList.length ? (
              <TableTw className="flex-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeaderTw sortId={'startDate'}>
                      {t('table.zeitraum')}
                    </TableHeaderTw>
                    <TableHeaderTw sortId={'days'}>
                      <TooltipTw
                        content={
                          <div className="break-normal">
                            {t('label.tageInfo')}
                          </div>
                        }
                        direction={TooltipDirection.Top}
                      >
                        {t('table.tage')}
                      </TooltipTw>
                    </TableHeaderTw>
                    <TableHeaderTw sortId={'urlaubType'}>
                      {t('table.art')}
                    </TableHeaderTw>
                    <TableHeaderTw sortId={'comment'}>
                      {t('table.bemerkung')}
                    </TableHeaderTw>
                    <TableHeaderTw sortId={'status'}>
                      {t('table.status')}
                    </TableHeaderTw>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {urlaubList.map((entry, index) => (
                    <tr key={index}>
                      <TableCellTw>{`${dayjs(entry.startDate).format('DD.MM.YYYY')} - ${dayjs(entry.endDate).format('DD.MM.YYYY')}`}</TableCellTw>
                      <TableCellTw>
                        <div className="flex items-center gap-1">
                          {entry.days}
                          {!entry.lhrCalculated && (
                            <TooltipTw
                              content={t('table.lhrCalculated.tooltip')}
                            >
                              <QuestionMarkCircleIcon className="text-ibis-blue size-4 cursor-help" />
                            </TooltipTw>
                          )}
                        </div>
                      </TableCellTw>
                      <TableCellTw>
                        {' '}
                        {entry.urlaubType === UrlaubType.Urlaub
                          ? t('urlaubType.urlaub')
                          : ''}
                      </TableCellTw>
                      <TableCellTw>{entry.comment}</TableCellTw>
                      <TableCellTw>
                        <AbwesenheitStatusBadge status={entry.status} />
                      </TableCellTw>
                    </tr>
                  ))}
                </tbody>
              </TableTw>
            ) : (
              <div className="flex min-h-48 items-center justify-center pb-8">
                <div className="block">
                  <p>{t('table.noData')}</p>
                </div>
              </div>
            )}
            <PaginationSimpleTw
              pageSize={PAGE_SIZE}
              totalResults={totalResults}
            />
          </>
        ) : (
          <div className="flex min-h-48 items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        )}
      </>
    </LayoutWrapper>
  )
}
