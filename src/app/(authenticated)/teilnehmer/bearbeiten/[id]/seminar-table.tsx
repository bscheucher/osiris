import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import SeminarDetailView from './seminar-detail-view'
import ButtonTw from '@/components/atoms/button-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import { SeminarEntry } from '@/lib/interfaces/teilnehmer'

const SHOW_COMPLEX_FIELDS =
  process.env.NEXT_PUBLIC_STAGE === 'dev' ||
  process.env.NEXT_PUBLIC_STAGE === 'qa'

const formatDateInput = (date?: string | null) =>
  date ? dayjs(date).format('DD.MM.YYYY') : ''

const SeminarTable: React.FC<{
  seminars?: SeminarEntry[] | null
  setSeminarData?: React.Dispatch<React.SetStateAction<SeminarEntry[]>>
  isReadOnly?: boolean
}> = ({ isReadOnly, seminars, setSeminarData }) => {
  const t = useTranslations('teilnehmer.bearbeiten')

  const [selectedSeminar, setSelectedSeminar] = useState<SeminarEntry | null>(
    null
  )
  return (
    seminars &&
    seminars.length > 0 && (
      <div className="border-b border-gray-900/10 pb-8">
        <h3 className="mb-6 text-base leading-7 font-semibold text-gray-900">
          {t('section.seminardaten')}
        </h3>
        <div className="bg-white shadow sm:rounded-md">
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.detailansicht')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.projektbezeichnung')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.seminarBezeichnung')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.buchungsstatus')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.eintritt')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {t('label.austritt')}
                </TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seminars.map((seminar, index) => (
                <tr key={index}>
                  <TableCellTw>
                    <ButtonTw onClick={() => setSelectedSeminar(seminar)}>
                      {t('label.detailansicht')}
                    </ButtonTw>
                  </TableCellTw>
                  <TableCellTw testId="seminar-td-projektName">
                    {seminar.projektName}
                  </TableCellTw>
                  <TableCellTw testId="seminar-td-seminarBezeichnung">
                    {seminar.seminarBezeichnung}
                  </TableCellTw>
                  <TableCellTw testId="seminar-td-buchungsstatus">
                    {seminar.buchungsstatus}
                  </TableCellTw>
                  <TableCellTw testId="seminar-td-eintritt">
                    {formatDateInput(seminar.eintritt)}
                  </TableCellTw>
                  <TableCellTw testId="seminar-td-austritt">
                    {formatDateInput(seminar.austritt)}
                  </TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
        </div>

        <DefaultModal
          showModal={!!selectedSeminar}
          modalSize="7xl"
          closeModal={() => setSelectedSeminar(null)}
          testId="unterhaltsberechtigte-form-modal"
        >
          <SeminarDetailView
            selectedSeminar={selectedSeminar}
            setSelectedSeminar={setSelectedSeminar}
            setSeminarData={setSeminarData}
          />
        </DefaultModal>
      </div>
    )
  )
}

export default SeminarTable
