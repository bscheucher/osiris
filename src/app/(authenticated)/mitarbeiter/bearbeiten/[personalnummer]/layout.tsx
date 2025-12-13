'use client'

import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { ReactNode } from 'react'

import { TabsContainerTw, TabsItemTw } from '@/components/atoms/tabs-tw'
import { ROLE } from '@/lib/constants/role-constants'
import useUserStore from '@/stores/user-store'

function Layout({ children }: { children: ReactNode }) {
  const t = useTranslations('mitarbeiter.bearbeiten')
  const { roles, user, hasSomeRole } = useUserStore()

  const pathname = usePathname()
  const { personalnummer } = useParams()

  //TODO UC04A.02 set readonly when role available
  const isReadOnly = false

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          {isReadOnly ? t('label.ansehen') : t('label.bearbeiten')}
        </h2>
      </div>
      <div className="bg-white p-8 pt-2 shadow sm:rounded-lg">
        <div className="relative flex min-h-[760px] flex-col">
          <TabsContainerTw>
            <TabsItemTw
              name={t('label.stammdaten')}
              href={`/mitarbeiter/bearbeiten/${personalnummer}`}
              current={
                !pathname.includes('vertragsdaten') &&
                !pathname.includes('changelog') &&
                !pathname.includes('zusaetze') &&
                !pathname.includes('projekte-seminare')
              }
            />
            <TabsItemTw
              name={t('label.vertragsdaten')}
              href={`/mitarbeiter/bearbeiten/${personalnummer}/vertragsdaten`}
              current={pathname.includes('vertragsdaten')}
            />
            <TabsItemTw
              name={t('label.changelog')}
              href={`/mitarbeiter/bearbeiten/${personalnummer}/changelog`}
              current={pathname.includes('changelog')}
            />
            <TabsItemTw
              name={t('label.zusaetze')}
              href={`/mitarbeiter/bearbeiten/${personalnummer}/zusaetze`}
              current={pathname.includes('zusaetze')}
            />
            {hasSomeRole(ROLE.MA_PROJEKTE_SEMINARE_LESEN) && (
              <TabsItemTw
                name={t('label.projekteSeminare')}
                href={`/mitarbeiter/bearbeiten/${personalnummer}/projekte-seminare`}
                current={pathname.includes('projekte-seminare')}
              />
            )}
          </TabsContainerTw>
          <div className="flex flex-col py-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Layout
