'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'
import { toQueryString } from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

type FormValues = {
  trainer: string
  abwesendVon: string
  abwesendBis: string
  grund: string
}

export default function Page() {
  const router = useRouter()
  const t = useTranslations('vertretungsplanung')
  const { register, control, watch, handleSubmit } = useForm<any>()
  const { masterdataTN: masterdata } = useMasterdataStore()

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit: SubmitHandler<FormValues> = async (formValues) => {
    setIsLoading(true)

    router.push(`/vertretungsplanung/uebersicht${toQueryString(formValues)}`)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.vertretungsplanung')}
        </h1>
      </div>
      <div className="relative rounded-lg bg-white p-8 shadow">
        {isLoading ? (
          <div className="flex h-[600px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <form className="block" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative grid grid-cols-12 gap-x-6 gap-y-6">
              <div className="col-span-12">
                <ComboSelectTw
                  label={t('form.label.trainer')}
                  placeholder={t('form.placeholder.trainer')}
                  control={control}
                  name="trainerId"
                  options={convertToKeyLabelOptions(
                    masterdata?.seminarVertretungTrainersList
                  )}
                />
              </div>
              <div className="col-span-6">
                <DatepickerTw
                  label={t('form.label.abwesendVon')}
                  placeholder={t('form.placeholder.abwesendVon')}
                  control={control}
                  name="von"
                />
              </div>
              <div className="col-span-6">
                <DatepickerTw
                  label={t('form.label.abwesendBis')}
                  placeholder={t('form.placeholder.abwesendBis')}
                  control={control}
                  name="bis"
                />
              </div>
              <div className="col-span-12 flex justify-center">
                <ButtonTw type="submit" size="large" isLoading={isLoading}>
                  {t('form.label.sucheStarten')}
                </ButtonTw>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
