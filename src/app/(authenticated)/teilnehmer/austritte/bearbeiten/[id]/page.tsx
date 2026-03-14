'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import AustrittEditForm from '@/app/(authenticated)/teilnehmer/austritte/anlegen/austritt-edit-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Austritt } from '@/lib/utils/austritte-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'

export default function Page() {
  const { id } = useParams()
  const t = useTranslations('teilnehmerAustritte.bearbeiten')
  const [isLoading, setIsLoading] = useState(true)
  const [austritt, setAustritt] = useState<Austritt | null>(null)

  useAsyncEffect(async () => {
    try {
      const austrittsId = Number(id)
      if (isNaN(austrittsId)) {
        throw new Error('Invalid ID')
      }
      const response = await executeGET<{
        uebaAbmeldungen: Austritt[]
      }>(`/teilnehmer/getUebaAbmeldung/${austrittsId}`)

      if (response.data?.uebaAbmeldungen[0]) {
        setAustritt(response.data.uebaAbmeldungen[0])
      }
    } catch (error) {
      showError(t('error.laden'))
    }
    setIsLoading(false)
  }, [])

  return (
    <LayoutWrapper className="max-w-2xl" title={t('label')}>
      {isLoading ? (
        <div className="flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        austritt && <AustrittEditForm mode="edit" austritt={austritt} />
      )}
    </LayoutWrapper>
  )
}
