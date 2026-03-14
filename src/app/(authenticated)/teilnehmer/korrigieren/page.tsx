'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import TeilnehmerSearchForm from '../verwalten/teilnehmer-search-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { TeilnehmerKorrigierenTable } from '@/components/molecules/teilnehmer-korrigieren-table'
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
  const t = useTranslations('teilnehmer.korrigieren')

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
            isFehlerhaft: 'true',
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
    <LayoutWrapper className="max-w-7xl" title={t('pageTitle')}>
      <TeilnehmerSearchForm isKorrigieren />

      {hasSearchParams && (
        <TeilnehmerKorrigierenTable
          teilnehmerList={teilnehmerList}
          totalResults={totalResults}
          isLoading={isLoading}
        />
      )}
    </LayoutWrapper>
  )
}
