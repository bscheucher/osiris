'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { VertragsaenderungEntry } from '../../vertragsaenderungen-utils'
import BasisDatenVertragsdatenForm from '../../views/basisdaten-vertragsdaten-form'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

const Page = () => {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')
  const { personalnummer } = useParams<{ personalnummer: string }>()
  const { fetchKostenstellen } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [vertragsDaten, setVertragsdaten] = useState<VertragsdatenEntry | null>(
    null
  )
  const [vertragsAenderung, setVertragsAenderung] =
    useState<VertragsaenderungEntry | null>(null)
  const router = useRouter()

  useAsyncEffect(async () => {
    try {
      await fetchKostenstellen(personalnummer)

      const response = await executeGET<{
        vertragsdaten: VertragsdatenEntry[]
      }>(`/mitarbeiter/vertragsdaten/edit/${personalnummer}`)

      if (response.data?.vertragsdaten[0]) {
        setVertragsdaten(response.data.vertragsdaten[0])
      }
    } catch (e) {
      showErrorMessage(e)
    }
    setIsLoading(false)
  }, [])

  // Combined submission handler that triggers both forms
  const onFormSave = async (payload: {
    vertragsdatenDto: Partial<VertragsdatenEntry>
    vertragsaenderungDto: Partial<VertragsaenderungEntry>
  }) => {
    setIsLoading(true)

    if (payload) {
      delete payload.vertragsdatenDto?.id
    }

    try {
      const response = await executePOST<{
        vertragsaenderung: VertragsaenderungEntry[]
        vertragsdaten: VertragsdatenEntry[]
      }>('/ma-verwalten/vertragsaenderung', payload)

      if (!response.data) {
        throw new Error('Daten konnten nicht geladen werden')
      }

      if (response.data?.vertragsdaten[0]) {
        setVertragsdaten(response.data.vertragsdaten[0])
      }

      const vertragsAenderung = response.data?.vertragsaenderung[0]

      if (vertragsAenderung) {
        setVertragsAenderung(vertragsAenderung)

        router.push(
          `/mitarbeiter/vertragsaenderungen/${vertragsAenderung.id}?wfi=43`
        )
      }
    } catch (e) {
      showErrorMessage(e)
      setIsLoading(false)
    }
  }

  return (
    <LayoutWrapper
      className="2xl:max-w-8xl max-w-6xl"
      title={t('labels.neuerZusatz')}
    >
      <BasisDatenVertragsdatenForm
        personalnummer={personalnummer}
        vertragsDaten={vertragsDaten}
        vertragsAenderung={vertragsAenderung}
        isLoading={isLoading}
        onSubmitHandler={onFormSave}
      />
    </LayoutWrapper>
  )
}

export default Page
