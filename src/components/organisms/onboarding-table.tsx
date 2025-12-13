import { LinkIcon } from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'

import { BlockingAwareLink } from '../atoms/blocking-aware-link'
import { TableCellTw, TableHeaderTw, TableTw } from '../molecules/table-tw'
import TooltipTw from '@/components/atoms/tooltip-tw'
import { WorkflowStatusBadge } from '@/components/molecules/workflow-status-badge-tw'
import { MitarbeiterWithWorkflow } from '@/lib/utils/mitarbeiter/overview-utils'
interface Props {
  mitarbeiterList: MitarbeiterWithWorkflow[]
  isTeilnehmer?: boolean
}

const getEditUrl = (
  person: MitarbeiterWithWorkflow,
  isTeilnehmer?: boolean
) => {
  const wfiParam = person.workflowItem?.referenceWorkflowItemId
    ? `?wfi=${person.workflowItem?.referenceWorkflowItemId}`
    : ''
  return `/${isTeilnehmer ? 'teilnehmer' : 'mitarbeiter'}/onboarding/${person.personalnummer}${wfiParam}`
}

const OnboardingTable = ({ mitarbeiterList, isTeilnehmer }: Props) => {
  const t = useTranslations('mitarbeiter.onboarding')

  return (
    <TableTw className="flex-auto">
      <thead className="bg-gray-50">
        <tr>
          <TableHeaderTw sortId={'nachname'}>{t('nachname')}</TableHeaderTw>
          <TableHeaderTw sortId={'vorname'}>{t('vorname')}</TableHeaderTw>
          <TableHeaderTw sortId={'svnr'}>{t('svnr')}</TableHeaderTw>
          <TableHeaderTw sortId={'eintritt'}>
            {t('eintrittsdatum')}
          </TableHeaderTw>
          <TableHeaderTw sortId={'kostenstelle'}>
            {t('kostenstelle')}
          </TableHeaderTw>
          <TableHeaderTw sortId={'status'}>{t('status')}</TableHeaderTw>
          <TableHeaderTw>{t('ueberpruefen')}</TableHeaderTw>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {mitarbeiterList.map((person, index) => (
          <tr key={index}>
            <TableCellTw>{person.nachname}</TableCellTw>
            <TableCellTw>{person.vorname}</TableCellTw>
            <TableCellTw>{person.svnr}</TableCellTw>
            <TableCellTw>{person.eintritt}</TableCellTw>
            <TableCellTw>{person.kostenstelle}</TableCellTw>
            <TableCellTw>
              <TooltipTw content={person?.workflowItem?.workflowItemName}>
                <WorkflowStatusBadge
                  className="inline-block max-w-64 truncate"
                  workflowItem={person.workflowItem}
                />
              </TooltipTw>
            </TableCellTw>
            <TableCellTw className="text-medium relative px-3 py-4 text-right whitespace-nowrap">
              {person?.workflowItem ? (
                <BlockingAwareLink
                  href={getEditUrl(person, isTeilnehmer)}
                  className="text-ibis-blue hover:text-ibis-blue-light flex flex-row gap-2 hover:underline"
                >
                  <LinkIcon className="h-4 w-4 shrink-0 items-center text-inherit" />
                  {t('ueberpruefen')}
                </BlockingAwareLink>
              ) : null}
            </TableCellTw>
          </tr>
        ))}
      </tbody>
    </TableTw>
  )
}

export default OnboardingTable
