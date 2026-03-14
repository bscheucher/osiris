import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import EmptyState from '@/components/atoms/empty-state'
import Loader from '@/components/atoms/loader'
import TitleComponent from '@/components/atoms/title'
import TableBody from '@/components/molecules/table-body'
import TableHeader from '@/components/molecules/table-header'
import { SeminarDto } from '@/lib/interfaces/dtos'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import { getMeineSeminareData } from '@/lib/utils/widget-utils'

export default function MeineSeminare() {
  const t = useTranslations('dashboard.meineSeminareDaten')
  const [isLoadingSeminars, setIsLoadingSeminars] = useState(false)
  const [seminarsData, setSeminarsData] = useState<SeminarDto[]>([])

  useEffect(() => {
    const fetchDataSeminars = async () => {
      setIsLoadingSeminars(true)
      await getMeineSeminareData<SeminarDto[]>()
        .then((seminars) => setSeminarsData(seminars))
        .catch((error) => showErrorMessage(error))
        .finally(() => setIsLoadingSeminars(false))
    }
    fetchDataSeminars()
  }, [])

  const header = [
    t('header.pnr'),
    t('header.snr'),
    t('header.seminar'),
    t('header.ort'),
    t('header.von'),
    t('header.bis'),
    t('header.uhrzeit'),
  ]

  const seminarsTable = seminarsData?.map((item) => [
    item.projektNummer.toString(),
    item.seminarNummer.toString(),
    item.seminar,
    item.ort,
    item.von,
    item.bis,
    item.uhrzeit,
  ])

  return (
    <div className="container mx-auto p-4">
      <TitleComponent title={t('titel')} />
      <div className="mb-4 max-h-full overflow-y-auto">
        {isLoadingSeminars ? (
          <Loader />
        ) : (
          <div className="overflow-y-auto">
            {seminarsData.length === 0 ? (
              <EmptyState text={t('keineDaten')} />
            ) : (
              <table className="w-full overflow-y-auto border border-x-0 border-t-0 border-slate-200 bg-white">
                <TableHeader columns={header} />
                <TableBody data={seminarsTable} />
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
