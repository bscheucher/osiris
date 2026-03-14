'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { Resolver, useForm } from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { toastTw } from '@/components/organisms/toast-tw'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'

interface MitarbeiterAnlegenFormValues {
  firma: string | null
}

export default function MitarbeiterAnlegenForm() {
  const { masterdataMA: masterdata } = useMasterdataStore()
  const t = useTranslations('mitarbeiter.erfassen.anlegen')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, control } =
    useForm<MitarbeiterAnlegenFormValues>({
      resolver: yupResolver(
        yup.object({
          firma: yup.string().required(t('errorMessages.firma')),
        })
      ) as Resolver<MitarbeiterAnlegenFormValues>,
      defaultValues: {
        firma: null,
      },
    })

  const onSubmit = useCallback(
    async ({ firma }: MitarbeiterAnlegenFormValues) => {
      setIsLoading(true)
      if (firma) {
        try {
          const response = await executeGET<{ personalnummer: string }>(
            `/mitarbeiter/generatePersonalnummer?firmenName=${firma}`
          )
          const personalnummer = response.data?.personalnummer
          if (personalnummer) {
            toastTw.info(t('mitarbeiterWurdeAngelegt'))
            router.replace(`/mitarbeiter/onboarding/${personalnummer}?wfi=3`)
          }
        } catch (e) {
          showErrorMessage(e)
        }
      }
    },
    [router, t]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8">
        <div className="mt-2">
          <ComboSelectTw
            label={t('firma')}
            options={convertToKeyLabelOptions(masterdata?.firmenList)}
            placeholder={t('firmaAuswaehlen')}
            control={control}
            {...register('firma')}
            disabled={isLoading}
            testId="firma"
          />
        </div>
      </div>

      <div className="mb-8">
        <InfoSectionTw description={t('infoText')} />
      </div>

      <div>
        <ButtonTw
          type="submit"
          size="large"
          className="w-full"
          isLoading={isLoading}
          testId="mitarbeiter-anlegen-save"
        >
          {t('mitarbeiterAnlegen')}
        </ButtonTw>
      </div>
    </form>
  )
}
