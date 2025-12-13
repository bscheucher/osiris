import { useTranslations } from 'next-intl'
import { FC, ReactNode } from 'react'

import ErrorSectionTw from './error-section-tw'
import { ROLE } from '@/lib/constants/role-constants'
import useUserStore from '@/stores/user-store'

export const PermissionWrapper: FC<{
  rolesToCheck: ROLE | ROLE[]
  children: ReactNode
}> = ({ children, rolesToCheck }) => {
  const t = useTranslations('common.label')

  const { hasSomeRole } = useUserStore()

  return hasSomeRole(rolesToCheck) ? (
    children
  ) : (
    <ErrorSectionTw description={t('keineRechte')} />
  )
}
