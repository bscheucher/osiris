import dayjs from 'dayjs'
import {useTranslations} from 'next-intl'

import {DauerCell, ZeitraumCell} from './abwesenheit-cells'
import {Abwesenheit} from './types'
import AbwesenheitStatusBadge from '@/components/molecules/abwesenheit-status-badge'
import {TableCellTw, TableHeaderTw, TableTw} from '@/components/molecules/table-tw'

const HEADER_CLASS = 'text-[11px] uppercase tracking-[0.7px] text-gray-400'

interface AbwesenheitenTableProps {
  abwesenheiten: Abwesenheit[]
  firstDayOfUrlaubsjahr: string
  lastDayOfUrlaubsjahr: string
  variant: 'current' | 'next'
}

export function AbwesenheitenTable({
  abwesenheiten,
  firstDayOfUrlaubsjahr,
  lastDayOfUrlaubsjahr,
  variant,
}: AbwesenheitenTableProps) {
  const t = useTranslations('urlaubsKonto.rework')

  const sorted = [...abwesenheiten].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
        <span className="text-4xl">{t('emptyState.icon')}</span>
        <span className="text-sm font-semibold text-gray-600">{t('emptyState.text')}</span>
        <span className="max-w-sm text-xs text-gray-400">{t('emptyState.sub')}</span>
      </div>
    )
  }

  const showBalanceAfterColumn = sorted.some((a) => a.balanceAfter !== null)

  const rowBorderClass =
    variant === 'current'
      ? 'border-l-[3px] border-l-orange-600'
      : 'border-l-[3px] border-l-ibis-emerald'

  return (
    <TableTw>
      <thead className="bg-gray-50">
        <tr>
          <TableHeaderTw className={HEADER_CLASS}>{t('table.erstellt')}</TableHeaderTw>
          <TableHeaderTw className={HEADER_CLASS}>{t('table.zeitraum')}</TableHeaderTw>
          <TableHeaderTw className={HEADER_CLASS}>{t('table.dauerUrlaubstage')}</TableHeaderTw>
          <TableHeaderTw className={HEADER_CLASS}>{t('table.status')}</TableHeaderTw>
          {showBalanceAfterColumn && (
            <TableHeaderTw className={`${HEADER_CLASS} w-24`}>{t('table.resturlaub')}</TableHeaderTw>
          )}
          <TableHeaderTw className={HEADER_CLASS}>{t('table.kommentarMitarbeiter')}</TableHeaderTw>
          <TableHeaderTw className={HEADER_CLASS}>{t('table.kommentarFuehrungskraft')}</TableHeaderTw>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {sorted.map((abwesenheit, index) => (
          <tr key={index} className={rowBorderClass}>
            <TableCellTw>
              {dayjs(abwesenheit.createdAt).format('DD.MM.YYYY HH:mm')}
            </TableCellTw>
            <TableCellTw>
              <ZeitraumCell
                startDate={abwesenheit.startDate}
                endDate={abwesenheit.endDate}
                isUrlaubsjahruebergreifend={
                  (abwesenheit.consumesInPreviousUrlaubsjahr ?? 0) > 0 ||
                  (abwesenheit.consumesInNextUrlaubsjahr ?? 0) > 0
                }
              />
            </TableCellTw>
            <TableCellTw>
              <DauerCell
                inCurrent={abwesenheit.consumesInCurrentUrlaubsjahr}
                inPrev={abwesenheit.consumesInPreviousUrlaubsjahr}
                inNext={abwesenheit.consumesInNextUrlaubsjahr}
                legacy={abwesenheit.legacyTageCalculation}
                overlapsPreviousYear={
                  abwesenheit.startDate < firstDayOfUrlaubsjahr
                }
                overlapsNextYear={abwesenheit.endDate > lastDayOfUrlaubsjahr}
                status={abwesenheit.status}
              />
            </TableCellTw>
            <TableCellTw>
              <AbwesenheitStatusBadge status={abwesenheit.status} />
            </TableCellTw>
            {showBalanceAfterColumn && (
              <TableCellTw className="w-24">
                <span className="font-bold text-orange-600">
                  {abwesenheit.balanceAfter ?? ''}
                </span>
              </TableCellTw>
            )}
            <TableCellTw>
              <span className="text-xs">{abwesenheit.comment}</span>
            </TableCellTw>
            <TableCellTw>
              <span className="text-xs">
                {abwesenheit.commentFuehrungskraft}
              </span>
            </TableCellTw>
          </tr>
        ))}
      </tbody>
    </TableTw>
  )
}
