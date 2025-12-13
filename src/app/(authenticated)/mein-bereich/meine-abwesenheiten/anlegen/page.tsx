'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import AbwesenheitEditForm from '../abwesenheit-edit-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'

export default function Page() {
  const t = useTranslations('meineAbwesenheiten.overview')
  return (
    <LayoutWrapper title={t('create')} className="max-w-2xl">
      <AbwesenheitEditForm />
    </LayoutWrapper>
  )
}
