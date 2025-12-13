import { LinkIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import InfoSectionTw from './info-section-tw'
import PaginationSimpleTw from './pagination-tw'
import { TableCellTw, TableHeaderTw, TableTw } from './table-tw'
import { BlockingAwareLink } from '../atoms/blocking-aware-link'
import ButtonTw from '../atoms/button-tw'
import LoaderTw, { LoaderSize } from '../atoms/loader-tw'
import TooltipTw, { TooltipDirection } from '../atoms/tooltip-tw'
import { DefaultModal } from '../organisms/default-modal'
import { TeilnehmerResult } from '@/lib/interfaces/teilnehmer'
import { getSearchParamsObject } from '@/lib/utils/form-utils'

interface Props {
  totalResults: number
  teilnehmerList: TeilnehmerResult[]
  isLoading: boolean
}

const PAGE_SIZE = 10

const getSeminarParam = (seminarNames: string[], override?: string) => {
  if (override) {
    return `?seminarName=${override}`
  }

  if (seminarNames.length === 1) {
    return `?seminarName=${seminarNames[0]}`
  }

  return ''
}

export const TeilnehmerKorrigierenTable = ({
  isLoading,
  totalResults,
  teilnehmerList,
}: Props) => {
  const searchParams = useSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)
  const t = useTranslations()
  const tVerwalten = useTranslations('teilnehmer.verwalten')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<null | TeilnehmerResult>(
    null
  )

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
        <div>{entries.join(', ')}</div>
      </TooltipTw>
    )
  }, [])

  const renderedErrors = useCallback(
    (errors: string[]) => {
      // remove duplicates
      const uniqueErrors = Array.from(new Set(errors))

      return uniqueErrors
        .map((error) => t(`teilnehmer.bearbeiten.label.${error}`))
        .join(', ')
    },
    [t]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedPerson(null)
    }, 300)
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
                <TableHeaderTw className="whitespace-nowrap">
                  {tVerwalten('table.seminarNamen')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tVerwalten('table.massnahmennummern')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tVerwalten('table.errors')}
                </TableHeaderTw>
                <TableHeaderTw className="text-right whitespace-nowrap">
                  {tVerwalten('table.bearbeiten')}
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
                    {entriesWithTooltip(person.seminarNamen)}
                  </TableCellTw>
                  <TableCellTw>
                    {entriesWithTooltip(person.massnahmennummern)}
                  </TableCellTw>
                  <TableCellTw>
                    <span className="text-red-600">
                      {renderedErrors(person.errors)}
                    </span>
                  </TableCellTw>
                  <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
                    {person.seminarNamen.length > 1 ? (
                      <button
                        className="text-ibis-blue hover:text-ibis-blue-dark flex cursor-pointer flex-row gap-2 hover:underline"
                        onClick={() => {
                          setSelectedPerson(person)
                          setIsModalOpen(true)
                        }}
                      >
                        <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />

                        {tVerwalten('table.bearbeiten')}
                      </button>
                    ) : (
                      <BlockingAwareLink
                        href={`/teilnehmer/korrigieren/${person.id}${getSeminarParam(person.seminarNamen, searchParamsObject.seminarName)}`}
                        className="text-ibis-blue hover:text-ibis-blue-dark flex flex-row gap-2 hover:underline"
                        data-testid="teilnehmer-edit-link"
                      >
                        <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />

                        {tVerwalten('table.bearbeiten')}
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
      <DefaultModal
        showModal={isModalOpen}
        modalSize="lg"
        closeModal={handleCloseModal}
      >
        <div className="flex flex-col gap-4">
          <h4 className="text-xl leading-5 font-semibold text-gray-900">
            {tVerwalten('label.seminarzuweiseungAuswaehlen')}
          </h4>
          <InfoSectionTw
            description={tVerwalten('label.seminarzuweiseungInfo')}
          />
          {selectedPerson &&
            selectedPerson.seminarNamen.map((seminarName) => (
              <ButtonTw
                key={seminarName}
                href={`/teilnehmer/korrigieren/${selectedPerson.id}?seminarName=${seminarName}`}
                className="gap-2"
                data-testid="teilnehmer-edit-link"
              >
                <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                {`${seminarName} ${tVerwalten('table.bearbeiten')}`}
              </ButtonTw>
            ))}
        </div>
      </DefaultModal>
    </>
  )
}
