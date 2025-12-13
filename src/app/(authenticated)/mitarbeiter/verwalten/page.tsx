'use client'

import { LinkIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import MitarbeiterSearchForm from './mitarbeiter-search-form'
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
import { ROLE } from '@/lib/constants/role-constants'
import {
  MitarbeiterResult,
  MitarbeiterType,
} from '@/lib/interfaces/mitarbeiter'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { SortDirection } from '@/lib/utils/mitarbeiter/overview-utils'
import { showError } from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'
import useUserStore from '@/stores/user-store'

const PAGE_SIZE = 25

export default function Page() {
  const { hasSomeRole } = useUserStore()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [defaultStatue, setDefaultState] = useState<boolean>(true)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [mitarbeiterList, setMitarbeiterList] = useState<MitarbeiterResult[]>(
    []
  )
  const { searchParamsObject, hasSearchParams } =
    getSearchParamsObject(searchParams)
  const { fetchMasterdata } = useMasterdataStore()
  const t = useTranslations('mitarbeiter.verwalten')

  useAsyncEffect(async () => {
    await fetchMasterdata(MitarbeiterType.Mitarbeiter)
  }, [])

  useAsyncEffect(async () => {
    if (hasSearchParams) {
      setIsLoading(true)
      setDefaultState(false)

      const searchParamsPage = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1

      try {
        const queryParams = {
          ...searchParamsObject,
          page: (searchParamsPage - 1).toString(),
          size: PAGE_SIZE.toString(),
          sortProperty: searchParams.get('sortProperty') || undefined,
          sortDirection:
            (searchParams.get('sortDirection') as SortDirection) || undefined,
        }

        const response = await executeGET<{
          maFiltered: MitarbeiterResult[]
        }>(`/ma-verwalten/search${toQueryString(queryParams)}`)

        if (response.data?.maFiltered && response.pagination) {
          setMitarbeiterList(response.data.maFiltered)
          setTotalResults(response.pagination.totalCount)
        }
      } catch (e) {
        showError(t('error.laden'))
      } finally {
        setIsLoading(false)
      }
    } else {
      setMitarbeiterList([])
      setDefaultState(true)
    }
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('title')}
    >
      <>
        <MitarbeiterSearchForm />
        {!defaultStatue && (
          <>
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
              ) : mitarbeiterList.length ? (
                <TableTw className="flex-auto" testId="mitarbeiter-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeaderTw sortId={'name'}>
                        {t('table.name')}
                      </TableHeaderTw>
                      <TableHeaderTw sortId={'kostenstelle'}>
                        {t('table.kostenstelle')}
                      </TableHeaderTw>
                      <TableHeaderTw sortId={'fuehrungskraft'}>
                        {t('table.fuehrungskraft')}
                      </TableHeaderTw>
                      <TableHeaderTw sortId={'svnr'}>
                        {t('table.svnr')}
                      </TableHeaderTw>
                      <TableHeaderTw className="text-right">
                        {t('table.bearbeiten')}
                      </TableHeaderTw>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mitarbeiterList.map((mitarbeiter, index) => (
                      <tr key={index}>
                        <TableCellTw>{mitarbeiter.name}</TableCellTw>
                        <TableCellTw>{mitarbeiter.kostenstelle}</TableCellTw>
                        <TableCellTw>{mitarbeiter.fuehrungskraft}</TableCellTw>
                        <TableCellTw>{mitarbeiter.svnr}</TableCellTw>
                        <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                          {hasSomeRole([ROLE.MA_LESEN, ROLE.MA_BEARBEITEN]) ? (
                            <BlockingAwareLink
                              href={`/mitarbeiter/bearbeiten/${mitarbeiter.personalnummer}`}
                              className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row justify-end gap-2 hover:underline"
                            >
                              <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                              {t('table.bearbeiten')}
                            </BlockingAwareLink>
                          ) : (
                            <span className="text-gray-400">
                              {t('table.noRole')}
                            </span>
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
            <PaginationSimpleTw
              pageSize={PAGE_SIZE}
              totalResults={totalResults}
            />
          </>
        )}
      </>
    </LayoutWrapper>
  )
}
