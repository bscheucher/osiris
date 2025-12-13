import { useTranslations } from 'next-intl'

import BadgeTw, { BadgeColor } from '../atoms/badge-tw'
import { AbwesenheitStatus } from '@/lib/utils/abwesenheit-utils'

export const getStatusBadge = (
  t: (key: string) => string,
  status: AbwesenheitStatus
) => {
  switch (status) {
    case AbwesenheitStatus.NEW:
    case AbwesenheitStatus.REQUEST_CANCELLATION:
    case AbwesenheitStatus.CANCELED:
    case AbwesenheitStatus.VALID:
      return (
        <BadgeTw color={BadgeColor.Yellow} className="w-full justify-center">
          {t(`${status.toLowerCase()}`)}
        </BadgeTw>
      )

    case AbwesenheitStatus.ACCEPTED:
    case AbwesenheitStatus.ACCEPTED_FINAL:
      return (
        <BadgeTw color={BadgeColor.Green} className="w-full justify-center">
          {t(`${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case AbwesenheitStatus.REJECTED:
    case AbwesenheitStatus.INVALID:
    case AbwesenheitStatus.ERROR:
      return (
        <BadgeTw color={BadgeColor.Red} className="w-full justify-center">
          {t(`${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case AbwesenheitStatus.USED:
      return (
        <BadgeTw color={BadgeColor.Purple} className="w-full justify-center">
          {t(`${status.toLowerCase()}`)}
        </BadgeTw>
      )
    default:
      return (
        <BadgeTw color={BadgeColor.Gray} className="w-full justify-center">
          {t('noStatus')}
        </BadgeTw>
      )
  }
}

const AbwesenheitStatusBadge = ({ status }: { status: AbwesenheitStatus }) => {
  const t = useTranslations('common.abwesenheitsstatus')

  return getStatusBadge(t, status)
}
export default AbwesenheitStatusBadge
