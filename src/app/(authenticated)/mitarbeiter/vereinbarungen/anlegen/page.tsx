'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

import { VereinbarungEntry } from '../vereinbarungen-utils'
import VereinbarungErstellenForm from '../views/vereinbarung-erstellen-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { Workflow } from '@/lib/interfaces/workflow'
import { executePOST } from '@/lib/utils/gateway-utils'

export default function Page() {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')
  const router = useRouter()

  const handleSave = async ({
    gueltigAb,
    gueltigBis,
    selectedMitarbeiter,
    selectedVereinbarung,
  }: any) => {
    const body = {
      personalnummer: selectedMitarbeiter,
      reportName: selectedVereinbarung,
      gueltigAb,
      gueltigBis,
      outputFormat: 'PDF',
      reportParameters: [],
    }

    const { data, success } = await executePOST<{
      vereinbarungen: VereinbarungEntry[]
      workflowgroup: Workflow[]
    }>(`/vereinbarung/create`, body)

    if (success) {
      const vereinbarung = data?.vereinbarungen[0]
      if (vereinbarung?.id) {
        router.push(`/mitarbeiter/vereinbarungen/${vereinbarung?.id}?wfi=38`)
      }
    }
  }

  return (
    <LayoutWrapper className="max-w-2xl" title={t('label.headline')}>
      <div className="flex gap-12">
        <VereinbarungErstellenForm handleSave={handleSave} />
      </div>
    </LayoutWrapper>
  )
}
