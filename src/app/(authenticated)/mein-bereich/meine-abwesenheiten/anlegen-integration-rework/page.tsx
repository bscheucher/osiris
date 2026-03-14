'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import AbwesenheitEditFormIntegrationRework
  from '@/app/(authenticated)/mein-bereich/meine-abwesenheiten/anlegen-integration-rework/abwesenheit-edit-form-integration-rework'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'

export default function Page() {
  const t = useTranslations('meineAbwesenheiten.overview')
  return (
    <LayoutWrapper title={t('createRework')} className="max-w-2xl">
      <AbwesenheitEditFormIntegrationRework />
    </LayoutWrapper>
  )
}
