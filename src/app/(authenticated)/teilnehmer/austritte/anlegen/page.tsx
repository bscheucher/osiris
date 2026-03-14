'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

import AustrittEditForm from '@/app/(authenticated)/teilnehmer/austritte/anlegen/austritt-edit-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'

export default function Page() {
  const t = useTranslations('teilnehmerAustritte.anlegen')

  const searchParams = useSearchParams()
  const queryParams = Object.fromEntries(searchParams.entries())

  const defaultValues = {
    teilnehmerId: parseInt(queryParams.teilnehmerId),
    vorname: queryParams.vorname,
    nachname: queryParams.nachname,
    svNummer: parseInt(queryParams.svNummer),
  }

  return (
    <LayoutWrapper className="max-w-2xl" title={t('label')}>
      <AustrittEditForm mode="create" austritt={defaultValues} />
    </LayoutWrapper>
  )
}
