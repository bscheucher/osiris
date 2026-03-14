import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { HiOutlineLink } from 'react-icons/hi2'

import { SelectCore } from '../atoms/input-select-tw'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import EmptyState from '@/components/atoms/empty-state'
import Loader from '@/components/atoms/loader'
import TitleComponent from '@/components/atoms/title'
import TableBody from '@/components/molecules/table-body'
import TableHeader from '@/components/molecules/table-header'
import { NewPariticipantsSummaryDto } from '@/lib/interfaces/dtos'
import { getCookie, setCookie } from '@/lib/utils/api-utils'
import { formatDate, getNextDay } from '@/lib/utils/date-utils'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import { getFehlerhafteTeilnehmerData } from '@/lib/utils/widget-utils'

const cookieKey = 'fehlerhafteTeilnehmerDaysPreselection'
type Days = { days: string }
export default function EingeleseneTeilnehmerdaten() {
  const t = useTranslations('dashboard.fehlerhafteTeilnehmer')
  const [isLoadingPariticipants, setIsLoadingPariticipants] = useState(false)

  const [daysSelection, setDaysSelection] = useState<string>('')
  const [participantsData, setParticipantsData] = useState<
    NewPariticipantsSummaryDto[]
  >([])

  useEffect(() => {
    const fetchDataParticipants = async () => {
      const days = (await getCookie<Days>(cookieKey))?.days ?? '5'
      if (daysSelection != days) {
        return setDaysSelection(days)
      }
      setIsLoadingPariticipants(true)
      await getFehlerhafteTeilnehmerData(formatDate(getNextDay(-daysSelection)))
        .then((participants) => setParticipantsData(participants))
        .catch((error) => showErrorMessage(error))
        .finally(() => setIsLoadingPariticipants(false))
    }
    fetchDataParticipants()
  }, [daysSelection])

  function getForwardUrl({
    seminarNummer,
    massnahmennummer,
  }: {
    seminarNummer?: string
    massnahmennummer?: string
  }) {
    if (seminarNummer) {
      return `/teilnehmer/korrigieren?seminarName=${encodeURIComponent(seminarNummer)}`
    }
    return `/teilnehmer/korrigieren${massnahmennummer ? `?massnahmenummer=${encodeURIComponent(massnahmennummer)}` : ''}`
  }

  const ErrorColumn = (
    invalid: any,
    {
      seminarNummer,
      massnahmennummer,
    }: {
      seminarNummer?: string
      massnahmennummer?: string
    }
  ) =>
    Number(invalid) !== 0 ? (
      <BlockingAwareLink
        href={getForwardUrl({ seminarNummer, massnahmennummer })}
        className="text-ibis-blue flex items-center"
      >
        {invalid}
        <HiOutlineLink className="ml-1 h-4 w-4" />
      </BlockingAwareLink>
    ) : (
      invalid
    )

  const headerUsers = [
    t('header.datum'),
    t('header.pnr'),
    t('header.snr'),
    t('header.seminar'),
    t('header.massnahmenummer'),
    t('header.dateiname'),
    t('header.gesamt'),
    t('header.ok'),
    ErrorColumn(t('header.fehler'), {}),
  ]

  const participantsTable = participantsData.map((item) => [
    item.date,
    item.projektNummer?.toString(),
    item.seminarNummer?.toString(),
    item.seminar,
    item.massnahmenummer,
    item.filename,
    item.gesamt.toString(),
    item.valid.toString(),
    ErrorColumn(item.invalid.toString(), {
      seminarNummer: item.seminar,
      massnahmennummer: item.massnahmenummer,
    }),
  ])

  const selectOptions = ['5', '10', '15', '20']
  const widths = [15, 5, 10, 20, 30, 5, 5]

  function handleSelectionChange(days: string) {
    setCookie<Days>('fehlerhafteTeilnehmerDaysPreselection', { days })
    setDaysSelection(days)
  }

  return (
    <div className="container mx-4 my-4">
      <div className="flex flex-row gap-10">
        <div className="self-end">
          <TitleComponent title={t('titel')} />
        </div>
        <div className="flex flex-col">
          {t('zeitraum')}
          <div className="relative">
            <SelectCore
              value={daysSelection}
              options={convertArrayToKeyLabelOptions(selectOptions)}
              onChange={(e) => void handleSelectionChange(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>
      <div className="my-4">
        {isLoadingPariticipants ? (
          <Loader />
        ) : (
          <div className="min-h-full">
            {participantsData.length === 0 ? (
              <EmptyState text={t('keineDaten')} />
            ) : (
              <table className="w-full border border-x-0 border-t-0 border-slate-200 bg-white">
                <TableHeader columns={headerUsers} widthPercents={widths} />
                <TableBody data={participantsTable} widthPercents={widths} />
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
