'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import PaginationSimpleTw from '@/components/molecules/pagination-tw'
import OnboardingTable from '@/components/organisms/onboarding-table'
import useAsyncEffect from '@/hooks/use-async-effect'
import { MitarbeiterType } from '@/lib/interfaces/mitarbeiter'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import {
  MitarbeiterWithWorkflow,
  SortDirection,
} from '@/lib/utils/mitarbeiter/overview-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

const PAGE_SIZE = 10

export default function Page() {
  const t = useTranslations('teilnehmer.onboarding')
  const searchParams = useSearchParams()

  const [mitarbeiterList, setMitarbeiterList] = useState<
    MitarbeiterWithWorkflow[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)

  useAsyncEffect(async () => {
    try {
      const searchParamsPage = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1
      const queryParams = {
        page: (searchParamsPage - 1).toString(),
        size: PAGE_SIZE.toString(),
        sortProperty: searchParams.get('sortProperty') || undefined,
        sortDirection:
          (searchParams.get('sortDirection') as SortDirection) || undefined,
        mitarbeiterType: MitarbeiterType.Teilnehmer,
      }
      const { data, pagination } = await executeGET<{
        mitarbeiterSummary: MitarbeiterWithWorkflow[]
      }>(`/mitarbeiter/list${toQueryString(queryParams)}`)
      const mitarbeiterSummary = data?.mitarbeiterSummary

      // check if data type was returned correctly
      if (mitarbeiterSummary && pagination) {
        setMitarbeiterList(mitarbeiterSummary)
        setTotalResults(pagination.totalCount)
      }
    } catch (e) {
      showErrorMessage(e)
    }

    setIsLoading(false)
  }, [searchParams])

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('title')}
    >
      <>
        <div className="flex min-h-48 items-center justify-center pb-8">
          {isLoading ? (
            <div className="flex h-[574px] items-center justify-center">
              <LoaderTw size={LoaderSize.XLarge} />
            </div>
          ) : (
            <OnboardingTable mitarbeiterList={mitarbeiterList} isTeilnehmer />
          )}
        </div>
        <PaginationSimpleTw pageSize={PAGE_SIZE} totalResults={totalResults} />
      </>
    </LayoutWrapper>
  )
}
