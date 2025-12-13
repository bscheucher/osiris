'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { TeilnehmerDownloadButton } from './teilnehmer-download-button'
import { TeilnehmerExportButton } from './teilnehmer-export-button'
import TeilnehmerSearchForm from './teilnehmer-search-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { TeilnehmerOverviewTable } from '@/components/molecules/teilnehmer-overview-table'
import useAsyncEffect from '@/hooks/use-async-effect'
import { TeilnehmerResult } from '@/lib/interfaces/teilnehmer'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

const PAGE_SIZE = 10

export default function Page() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [teilnehmerList, setTeilnehmerList] = useState<TeilnehmerResult[]>([])
  const { searchParamsObject, hasSearchParams } =
    getSearchParamsObject(searchParams)
  const t = useTranslations('teilnehmer.verwalten')

  useAsyncEffect(async () => {
    if (hasSearchParams) {
      setIsLoading(true)

      const searchParamsPage = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1
      try {
        const { data, pagination } = await executeGET<{
          teilnehmerSummary: TeilnehmerResult[]
        }>(
          `/teilnehmer/getTeilnehmerFilterSummaryDto${toQueryString({
            sortDirection: 'ASC',
            ...searchParamsObject,
            page: searchParamsPage - 1,
            size: PAGE_SIZE,
          })}`
        )

        // check if data type was returned correctly
        if (data?.teilnehmerSummary && pagination) {
          setTeilnehmerList(data.teilnehmerSummary)
          setTotalResults(pagination.totalCount)
        } else {
          throw new Error('Keine Daten gefunden')
        }
      } catch (e) {
        showErrorMessage(e)
      }

      setIsLoading(false)
    }
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-7xl"
      title={t('title')}
      button={
        hasSearchParams &&
        teilnehmerList.length > 0 && (
          <div className="flex items-center justify-end gap-2">
            <TeilnehmerExportButton />
            <TeilnehmerDownloadButton />
          </div>
        )
      }
    >
      <TeilnehmerSearchForm />
      {hasSearchParams && (
        <TeilnehmerOverviewTable
          teilnehmerList={teilnehmerList}
          isLoading={isLoading}
          totalResults={totalResults}
        />
      )}
    </LayoutWrapper>
  )
}
