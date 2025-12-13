import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import Loader from '@/components/atoms/loader'
import SubtitleComponent from '@/components/atoms/subtitle'
import TitleComponent from '@/components/atoms/title'
import TableBody from '@/components/molecules/table-body'
import TableHeader from '@/components/molecules/table-header'
import { ContracDataDto } from '@/lib/interfaces/dtos'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import { getWidgetData } from '@/lib/utils/widget-utils'

export default function MeinePersoenlichenDaten() {
  const t = useTranslations('dashboard.meinePersoenlichenDaten')
  const [isLoading, setIsLoading] = useState(false)
  const [contractData, setContractData] = useState<ContracDataDto[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const contractsResponse: ContracDataDto[] = await getWidgetData(3)
        setContractData(contractsResponse as ContracDataDto[])
      } catch (error) {
        showErrorMessage(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const headerContract = [
    t('header.vertrag.personalnummer'),
    t('header.vertrag.eintrittsdatum'),
    t('header.vertrag.dienstort'),
  ]
  const headerHistory = [
    t('header.historie.von'),
    t('header.historie.bis'),
    t('header.historie.kostenstelle'),
    t('header.historie.funktion'),
    t('header.historie.arbeitszeitmodell'),
    t('header.historie.wochenstunden'),
    t('header.historie.verwendungsgruppe'),
    t('header.historie.stufe'),
    t('header.historie.dienstunterbrechung'),
  ]

  const widths = [10, 10, 5, 10, 5, 5, 35, 15, 5]
  const details = contractData[contractData.length - 1]

  const contractTable = [
    details?.personalNummer || '',
    details?.eintrittsdatum || '',
    details?.dienstort || '',
  ]

  const historyTable = contractData.map((item) => [
    item.datumVon,
    item.datumBis,
    item.kst.toString(),
    item.funktion,
    item.arbeitszeitmodel,
    item.wochenstunden.toString(),
    item.verwendungsgruppe,
    item.stufe,
    item.nichtLeistungen,
  ])

  return (
    <div className="container mx-auto p-4 py-10">
      <TitleComponent title={t('titel')} />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="relative mb-12 max-h-[350px]">
            <SubtitleComponent subtitle={t('header.subtitel.meinVertrag')} />
            <div className="overflow-y-auto">
              <table className="min-w-full border border-slate-200 bg-white">
                <tbody>
                  {contractTable.map((item, index) => (
                    <tr key={index}>
                      <th className="border-b border-gray-300 bg-gray-50 px-4 py-2 text-left font-normal">
                        {headerContract[index]}
                      </th>
                      <td className="border-b border-gray-300 px-4 py-2">
                        {item}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4 max-h-[350px]">
            <SubtitleComponent subtitle={t('header.subtitel.meineLaufbahn')} />
            <div className="overflow-y-auto">
              <table className="w-full overflow-y-auto border border-x-0 border-t-0 border-slate-200 bg-white">
                <TableHeader columns={headerHistory} widthPercents={widths} />
                <TableBody data={historyTable} widthPercents={widths} />
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
