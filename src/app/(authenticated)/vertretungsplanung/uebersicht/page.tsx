'use client'
import 'dayjs/locale/de'

import { CheckIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import VertretungsplanungForm from './vertretungsplanung-form'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import { showError, showErrorMessage } from '@/lib/utils/toast-utils'
import { VertretungsPlan } from '@/lib/utils/vertretungsplannung-utils'

dayjs.locale('de')

export default function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const t = useTranslations('vertretungsplanung')
  const [isLoading, setIsLoading] = useState(true)
  const [metaData, setMetaData] = useState<
    VertretungsPlan['vertretungsplanungMetaData'] | null
  >(null)
  const [vertretungsTables, setVertregungsTables] = useState<
    VertretungsPlan['vertretungsplanungTable'] | null
  >(null)

  useAsyncEffect(async () => {
    try {
      const searchParamsObj = Object.fromEntries(searchParams)
      const { data, success } = await executeGET<{
        vertretungsPlan: VertretungsPlan[]
      }>(`/ai-engine/seminar-vertretung${toQueryString(searchParamsObj)}`, {
        withCache: true,
      })

      if (success) {
        if (data?.vertretungsPlan) {
          const vertretungsPlan = data?.vertretungsPlan[0]
          if (vertretungsPlan.vertretungsplanungMetaData) {
            setMetaData(vertretungsPlan.vertretungsplanungMetaData)
          }
          if (vertretungsPlan.vertretungsplanungTable) {
            setVertregungsTables(vertretungsPlan.vertretungsplanungTable)
          }
        }
      } else {
        showError(
          'Die Anfrage ist fehlgeschlagen, bitte versuchen Sie es erneut.'
        )
        router.push(`/vertretungsplanung`)
      }
    } catch (error) {
      showErrorMessage(error)
    }
    setIsLoading(false)
  }, [])

  return (
    <div className="max-w-8xl container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.vertretungsplanungUebersicht')}
        </h1>
        <div className="flex gap-4">
          <ButtonTw
            secondary
            href="/vertretungsplanung"
            size={ButtonSize.Large}
          >
            {t('labels.vertretungAbbrechen')}
          </ButtonTw>
          <ButtonTw
            href={`/vertretungsplanung/ergebnis?${searchParams.toString()}`}
            className="flex items-center gap-2"
            size={ButtonSize.Large}
          >
            <CheckIcon className="h-6 w-6" />
            {t('labels.vertretungBestaetigen')}
          </ButtonTw>
        </div>
      </div>
      <div className="relative rounded-lg bg-white shadow">
        {!metaData || !vertretungsTables || isLoading ? (
          <div className="flex h-[760px] flex-col items-center justify-center">
            <p className="mb-6 font-bold">
              Die Vertretungspläne werden berechnet...
            </p>
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <div className="px-8">
            <VertretungsplanungForm
              vertretungsplanungMetaData={metaData}
              vertretungsplanungTable={vertretungsTables}
            />
          </div>
        )}
      </div>
    </div>
  )
}
