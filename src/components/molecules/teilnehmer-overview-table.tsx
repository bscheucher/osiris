import { LinkIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

import PaginationSimpleTw from './pagination-tw'
import { TableCellTw, TableHeaderTw, TableTw } from './table-tw'
import { BlockingAwareLink } from '../atoms/blocking-aware-link'
import LoaderTw, { LoaderSize } from '../atoms/loader-tw'
import TooltipTw, { TooltipDirection } from '../atoms/tooltip-tw'
import { ROLE } from '@/lib/constants/role-constants'
import {
  TeilnehmerResult,
  TeilnehmerValidityStatus,
} from '@/lib/interfaces/teilnehmer'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import useUserStore from '@/stores/user-store'

interface Props {
  totalResults: number
  teilnehmerList: TeilnehmerResult[]
  isLoading: boolean
  isKorrigieren?: boolean
}

const PAGE_SIZE = 10
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_MODE

const getSeminarParam = (seminarNames: string[], override?: string) => {
  if (override) {
    return `?seminarName=${override}`
  }

  if (seminarNames.length === 1) {
    return `?seminarName=${seminarNames[0]}`
  }

  return ''
}

export const TeilnehmerOverviewTable = ({
  isLoading,
  totalResults,
  teilnehmerList,
}: Props) => {
  const searchParams = useSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)
  const { hasSomeRole } = useUserStore()
  const tVerwalten = useTranslations('teilnehmer.verwalten')

  const entriesWithTooltip = useCallback((entries?: string[]) => {
    if (!entries || !entries.length) {
      return null
    }

    return (
      <TooltipTw
        content={
          <div className="break-normal">
            <ul className="leading-loose">
              {entries.map((seminarName: string, index: number) => (
                <li key={index}>{seminarName}</li>
              ))}
            </ul>
          </div>
        }
        direction={TooltipDirection.Top}
      >
        <div className={'max-w-40 truncate'}>{entries.join(', ')}</div>
      </TooltipTw>
    )
  }, [])

  return (
    <>
      <div className="flex min-h-48 items-center justify-center py-8">
        {isLoading ? (
          <div
            className={twMerge(
              'flex items-center justify-center',
              totalResults > PAGE_SIZE ? 'h-[600px]' : 'min-h-12'
            )}
          >
            <LoaderTw size={LoaderSize.Large} />
          </div>
        ) : teilnehmerList.length ? (
          <TableTw className="flex-auto" testId="teilnehmer-table">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw sortId="vorname" className="whitespace-nowrap">
                  {tVerwalten('table.vorname')}
                </TableHeaderTw>
                <TableHeaderTw sortId="nachname" className="whitespace-nowrap">
                  {tVerwalten('table.nachname')}
                </TableHeaderTw>
                <TableHeaderTw sortId="svn" className="whitespace-nowrap">
                  {tVerwalten('table.svnr')}
                </TableHeaderTw>

                <TableHeaderTw
                  sortId="angemeldetIn"
                  className="whitespace-nowrap"
                >
                  {tVerwalten('table.angemeldetIn')}
                </TableHeaderTw>
                <TableHeaderTw sortId="plz">
                  {tVerwalten('table.plz')}
                </TableHeaderTw>
                <TableHeaderTw sortId="ort">
                  {tVerwalten('table.ort')}
                </TableHeaderTw>
                {isDebugEnabled ? (
                  <TableHeaderTw className="whitespace-nowrap">
                    {tVerwalten('table.ueba')}
                  </TableHeaderTw>
                ) : (
                  ''
                )}
                <TableHeaderTw className="text-right whitespace-nowrap">
                  {hasSomeRole([ROLE.TN_BEARBEITEN])
                    ? tVerwalten('table.bearbeiten')
                    : tVerwalten('table.ansehen')}
                </TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teilnehmerList.map((person) => (
                <tr key={person.id}>
                  <TableCellTw>{person.vorname}</TableCellTw>
                  <TableCellTw>{person.nachname}</TableCellTw>
                  <TableCellTw>{person.svn}</TableCellTw>

                  <TableCellTw>
                    {entriesWithTooltip(person.angemeldetIn)}
                  </TableCellTw>
                  <TableCellTw>{person.plz}</TableCellTw>
                  <TableCellTw>{person.ort}</TableCellTw>

                  {isDebugEnabled ? (
                    <TableCellTw>
                      {person?.status === TeilnehmerValidityStatus.VALID &&
                      person?.ueba === true
                        ? 'Ja'
                        : ''}
                    </TableCellTw>
                  ) : (
                    ''
                  )}
                  <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                    {hasSomeRole([ROLE.TN_BEARBEITEN, ROLE.TN_LESEN]) && (
                      <BlockingAwareLink
                        href={`/teilnehmer/bearbeiten/${person.id}${getSeminarParam(person.seminarNamen, searchParamsObject.seminarName)}`}
                        className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row gap-2 hover:underline"
                        data-testid="teilnehmer-edit-link"
                      >
                        <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />

                        {hasSomeRole([ROLE.TN_BEARBEITEN])
                          ? tVerwalten('table.bearbeiten')
                          : tVerwalten('table.ansehen')}
                      </BlockingAwareLink>
                    )}
                  </TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
        ) : (
          <div className="block">
            <p>{tVerwalten('table.isEmpty')}</p>
          </div>
        )}
      </div>
      <PaginationSimpleTw pageSize={PAGE_SIZE} totalResults={totalResults} />
    </>
  )
}
