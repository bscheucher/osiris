'use client'

import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import AnwesenheitEditForm, {
  AnwesenheitEntry,
  AnwesenheitFormData,
  TeilnahmeMetadata,
  TeilnahmeOverview,
} from './anwesenheiten-edit-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import 'dayjs/locale/de'
import { ROLE } from '@/lib/constants/role-constants'
import {
  executeGET,
  executePOST,
  toQueryString,
} from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

dayjs.extend(isToday)
dayjs.locale('de')

export default function Page() {
  const { id } = useParams()
  const router = useRouter()
  const { hasSomeRole } = useUserStore()
  const canView = hasSomeRole([
    ROLE.TN_TR_ANWESENHEITEN_LESEN,
    ROLE.TN_ADMIN_ANWESENHEITEN_LESEN,
    ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
    ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
  ])

  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')

  const t = useTranslations('anwesenheitenVerwalten.detail')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [metadata, setMetadata] = useState<TeilnahmeMetadata | null>(null)
  const [abwesenheitEntries, setAbwesenheitEntries] = useState<
    AnwesenheitEntry[]
  >([])

  useAsyncEffect(async () => {
    if (!dateParam || !dayjs(dateParam).isValid()) {
      const today = dayjs().format('YYYY-MM-DD')
      router.replace(`/teilnehmer/anwesenheiten-verwalten/${id}?date=${today}`)
      return
    }

    setIsLoading(true)

    try {
      const { data } = await executeGET<{
        teilnahmeOverview: TeilnahmeOverview[]
      }>(
        `/seminar/${id}/teilnahme${toQueryString({
          date: dateParam,
        })}`
      )

      if (data?.teilnahmeOverview[0]) {
        const { teilnahmeMetadata, teilnehmers } = data.teilnahmeOverview[0]

        setMetadata(teilnahmeMetadata)
        setAbwesenheitEntries(teilnehmers)
      }
    } catch (e) {
      showErrorMessage(e)
    }

    setIsLoading(false)
  }, [searchParams])

  const onSubmit = async (formValues: AnwesenheitFormData) => {
    if (formValues.entries.length > 0) {
      setIsLoading(true)

      try {
        const { data } = await executePOST<{
          teilnahmeOverview: TeilnahmeOverview[]
        }>(`/seminar/teilnahme`, {
          seminarId: id,
          date: dateParam,
          teilnehmers: formValues.entries,
        })

        if (data?.teilnahmeOverview[0]) {
          const { teilnahmeMetadata, teilnehmers } = data.teilnahmeOverview[0]

          setMetadata(teilnahmeMetadata)
          setAbwesenheitEntries(teilnehmers)
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <LayoutWrapper
      className="max-w-8xl"
      title={`${t('title')}: ${metadata?.bezeichnung ? metadata?.bezeichnung : ''}`}
    >
      {isLoading && (
        <>
          <div className="absolute top-0 left-0 z-40 flex h-full w-full rounded-lg bg-white/60"></div>
          <div className="sticky top-[450px] z-50 flex h-0 w-full items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        </>
      )}

      {canView ? (
        <AnwesenheitEditForm
          seminarId={id}
          dateParam={dateParam}
          metadata={metadata}
          abwesenheitEntries={abwesenheitEntries}
          isLoading={isLoading}
          onSubmit={onSubmit}
        />
      ) : (
        <InfoSectionTw description={t('label.noRoleDescription')} />
      )}
    </LayoutWrapper>
  )
}
