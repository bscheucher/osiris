'use client'

import { LinkIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import AnwesenheitenSearchForm from './anwesenheiten-search-form'
import { AnwesenheitSeminarEntry } from './anwesenheiten-verwalten-utils'
import TrainerData from './trainer-data'
import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import Loader from '@/components/atoms/loader'
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
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const PAGE_SIZE = 10

const getVerzoegerungBadge = (
  verzoegerung: number,
  t: ReturnType<typeof useTranslations>
) => {
  return verzoegerung <= 0 ? (
    <BadgeTw color={BadgeColor.Green}>{t('label.keine')}</BadgeTw>
  ) : (
    <BadgeTw
      color={BadgeColor.Red}
    >{`${verzoegerung} ${t('label.tage')}`}</BadgeTw>
  )
}

export default function Page() {
  const searchParams = useSearchParams()
  const { hasSomeRole } = useUserStore()
  const { searchParamsObject } = getSearchParamsObject(searchParams)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [seminarList, setSeminarList] = useState<AnwesenheitSeminarEntry[]>([])

  const t = useTranslations('anwesenheitenVerwalten')
  const todayDate = dayjs().format('YYYY-MM-DD')
  const canView = hasSomeRole([
    ROLE.TN_TR_ANWESENHEITEN_LESEN,
    ROLE.TN_ADMIN_ANWESENHEITEN_LESEN,
    ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
    ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
  ])

  useAsyncEffect(async () => {
    setIsLoading(true)

    const searchParamsPage = searchParams.get('page')
      ? parseInt(searchParams.get('page') as string)
      : 1

    try {
      const { data, pagination } = await executeGET<{
        seminars: AnwesenheitSeminarEntry[]
      }>(
        `/seminar/getSeminarAnAbwesenheitDto${toQueryString({
          ...searchParamsObject,
          page: searchParamsPage - 1,
          size: PAGE_SIZE,
        })}`
      )

      // check if data type was returned correctly
      if (data?.seminars && pagination) {
        setSeminarList(data.seminars)
        setTotalResults(pagination.totalCount)
      } else {
        throw new Error('Suche fehlgeschlagen')
      }
    } catch (e) {
      showErrorMessage(e)
    }

    setIsLoading(false)
  }, [searchParams])

  return (
    <LayoutWrapper
      className="2xl:max-w-8xl max-w-6xl"
      title={t('overview.pageTitle')}
    >
      {canView ? (
        <>
          {hasSomeRole(ROLE.TR_ANWESENHEITEN_FILTER) && (
            <AnwesenheitenSearchForm />
          )}
          <div className="flex min-h-48 items-center justify-center">
            {isLoading ? (
              <div className="block">
                <Loader />
              </div>
            ) : seminarList.length ? (
              <TableTw className="flex-auto" testId="teilnehmer-table">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeaderTw
                      sortId="projekt"
                      className="whitespace-nowrap"
                    >
                      {t('table.projekt')}
                    </TableHeaderTw>
                    <TableHeaderTw
                      sortId="seminar"
                      className="whitespace-nowrap"
                    >
                      {t('table.seminar')}
                    </TableHeaderTw>
                    <TableHeaderTw
                      sortId="standort"
                      className="whitespace-nowrap"
                    >
                      {t('table.standort')}
                    </TableHeaderTw>
                    <TableHeaderTw sortId="von" className="whitespace-nowrap">
                      {t('table.von')}
                    </TableHeaderTw>
                    <TableHeaderTw sortId="bis" className="whitespace-nowrap">
                      {t('table.bis')}
                    </TableHeaderTw>
                    <TableHeaderTw
                      className="whitespace-nowrap"
                      sortId="verzoegerung"
                    >
                      {t('table.verzoegerung')}
                    </TableHeaderTw>
                    {hasSomeRole(ROLE.TR_ANWESENHEITEN_FILTER) && (
                      <TableHeaderTw className="whitespace-nowrap">
                        {t('table.trainer')}
                      </TableHeaderTw>
                    )}
                    <TableHeaderTw
                      sortId="zuletztGeaendert"
                      className="whitespace-nowrap"
                    >
                      {t('table.zuletztGeaendert')}
                    </TableHeaderTw>
                    <TableHeaderTw className="text-right">
                      {t('table.bearbeiten')}
                    </TableHeaderTw>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {seminarList.map((entry) => (
                    <tr key={entry.seminarId}>
                      <TableCellTw className="whitespace-nowrap">
                        {entry.project}
                      </TableCellTw>
                      <TableCellTw className="whitespace-nowrap">
                        {entry.seminar}
                      </TableCellTw>
                      <TableCellTw>{entry.standort}</TableCellTw>
                      <TableCellTw>
                        {dayjs(entry.von).format('DD.MM.YYYY')}
                      </TableCellTw>
                      <TableCellTw>
                        {dayjs(entry.bis).format('DD.MM.YYYY')}
                      </TableCellTw>
                      <TableCellTw>
                        {getVerzoegerungBadge(entry.verzoegerung, t)}
                      </TableCellTw>
                      {hasSomeRole(ROLE.TR_ANWESENHEITEN_FILTER) && (
                        <TableCellTw>
                          <TrainerData trainerList={entry.trainers} />
                        </TableCellTw>
                      )}
                      <TableCellTw>
                        {dayjs(entry.changedOn).format('DD.MM.YYYY')}
                      </TableCellTw>
                      <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                        <BlockingAwareLink
                          href={`/teilnehmer/anwesenheiten-verwalten/${entry.seminarId}?date=${todayDate}`}
                          className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row gap-2 hover:underline"
                          data-testid="teilnehmer-edit-link"
                        >
                          <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                          {hasSomeRole([
                            ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
                            ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
                          ])
                            ? t('table.bearbeiten')
                            : t('table.ansehen')}
                        </BlockingAwareLink>
                      </TableCellTw>
                    </tr>
                  ))}
                </tbody>
              </TableTw>
            ) : (
              <div className="block">
                <p>{t('table.keineEintraege')}</p>
              </div>
            )}
          </div>
          <PaginationSimpleTw
            pageSize={PAGE_SIZE}
            totalResults={totalResults}
          />
        </>
      ) : (
        <InfoSectionTw description={t('label.noRoleDescription')} />
      )}
    </LayoutWrapper>
  )
}
