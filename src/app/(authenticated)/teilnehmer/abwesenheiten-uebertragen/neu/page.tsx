'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import TransferOverview from './transfer-overview'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectMultipleTw from '@/components/atoms/combo-select-multiple-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useModal } from '@/hooks/use-modal'
import { ZeiterfassungUebermittlung } from '@/lib/utils/abwesenheit-utils'
import { getSeminarsWithDataFromOptions, Option } from '@/lib/utils/form-utils'
import {
  executeGET,
  executePOST,
  toQueryString,
} from '@/lib/utils/gateway-utils'
import { SeminarWithData } from '@/lib/utils/teilnehmer-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

type FormValues = {
  datumVon: Date
  datumBis: Date
  seminars: Option[]
}

export default function Page() {
  const t = useTranslations('abwesenheitenUebertragen.create')
  const router = useRouter()
  const [seminarListWithData, setSeminarListWithData] = useState<
    SeminarWithData[]
  >([])
  const { setModalContent, setShowModal } = useModal()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, control, setValue, getValues, handleSubmit } =
    useForm<FormValues>({
      resolver: yupResolver(
        yup.object({
          seminars: yup
            .array()
            .test('is-not-empty', t('errors.seminare'), (value) => {
              return value && value.length > 0
            }),
          datumVon: yup.date().required(t('errors.datumVon')),
          datumBis: yup
            .date()
            .required(t('errors.datumBis'))
            .min(yup.ref('datumVon'), t('errors.datumBisGreater')),
        })
      ) as unknown as Resolver<FormValues>,
      defaultValues: {
        seminars: [],
        datumVon: dayjs().startOf('month').toDate(),
        datumBis: dayjs().add(1, 'month').startOf('month').toDate(),
      },
    })

  const seminarOptions = seminarListWithData
    ? seminarListWithData.map((seminar) => ({
        id: seminar.id,
        name: `${seminar.seminarBezeichnung} (${seminar.seminarNumber})`,
      }))
    : []

  useAsyncEffect(async () => {
    const { data } = await executeGET<{ seminars: SeminarWithData[] }>(
      `/seminar/allSeminars${toQueryString({
        page: 0,
        size: 9999,
        isUeba: true,
      })}`
    )
    if (data?.seminars) {
      setSeminarListWithData(data.seminars)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (getValues('seminars').length === 0) {
      setValue('seminars', seminarOptions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seminarListWithData])

  const handleRequest = async (
    { datumVon, datumBis, seminars }: FormValues,
    shouldSubmit = false
  ) => {
    setIsSubmitting(true)
    try {
      const payload = {
        datumVon: dayjs(datumVon).format('YYYY-MM-DD'),
        datumBis: dayjs(datumBis).format('YYYY-MM-DD'),
        seminars: getSeminarsWithDataFromOptions(seminarListWithData, seminars),
      }
      const response = await executePOST<{
        teilnehmerZeiterfassungTransfer: ZeiterfassungUebermittlung[]
      }>(
        `/teilnehmer/submitTeilnehmersZeiterfassung?shouldSubmit=${shouldSubmit}`,
        payload
      )
      return response.data
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPreview: SubmitHandler<FormValues> = async (data) => {
    const response = await handleRequest(data, false)

    if (response?.teilnehmerZeiterfassungTransfer[0]) {
      const { datumVon, datumBis, seminars, teilnehmerNumber } =
        response.teilnehmerZeiterfassungTransfer[0]
      setModalContent(
        <>
          <TransferOverview
            {...{ datumVon, datumBis, seminars, teilnehmerNumber }}
            onAbort={() => {
              setShowModal(false)
            }}
            onSubmit={handleSubmit(onSubmit)}
          />
        </>
      )
      setShowModal(true)
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await handleRequest(data, true)
    setShowModal(false)

    router.push('/teilnehmer/abwesenheiten-uebertragen')
  }

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label')}
    >
      {isLoading ? (
        <div className="flex h-[540px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onPreview)}>
            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
              <div className="col-span-4 sm:col-span-2">
                <DatepickerTw
                  label={t('dateFrom')}
                  placeholder={t('dateFrom')}
                  control={control}
                  {...register('datumVon')}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <DatepickerTw
                  label={t('dateTo')}
                  placeholder={t('dateTo')}
                  control={control}
                  {...register('datumBis')}
                />
              </div>
              <div className="col-span-4">
                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                  <div className="col-span-4">
                    <ComboSelectMultipleTw
                      control={control}
                      label={t('seminarName')}
                      options={seminarOptions}
                      placeholder={t('seminarNamePlaceholder')}
                      disabled={isLoading}
                      disableInput
                      {...register('seminars')}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <ButtonTw
                      type="button"
                      className="h-full w-full"
                      secondary
                      onClick={() => {
                        setValue('seminars', [])
                      }}
                    >
                      {t('resetSeminars')}
                    </ButtonTw>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <ButtonTw
                      type="button"
                      className="bg-ibis-yellow hover:bg-ibis-yellow-light h-full w-full ring-yellow-500"
                      onClick={() => {
                        if (
                          getValues('seminars').length !== seminarOptions.length
                        ) {
                          setValue('seminars', seminarOptions)
                        }
                      }}
                    >
                      {t('selectAllSeminars')}
                    </ButtonTw>
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                <InfoSectionTw description={t('infoText')} />
              </div>
              <HorizontalRow className={'col-span-4'} />
              <div className="col-span-4 sm:col-span-2">
                <ButtonTw
                  className="h-full w-full"
                  size={ButtonSize.XLarge}
                  disabled={isLoading}
                  isLoading={isLoading}
                  href="/teilnehmer/abwesenheiten-uebertragen"
                  secondary
                >
                  {t('abort')}
                </ButtonTw>
              </div>
              <div className="col-span-4 sm:col-span-2">
                <ButtonTw
                  type="submit"
                  className="h-full w-full"
                  size={ButtonSize.XLarge}
                  disabled={isLoading}
                  isLoading={isSubmitting}
                >
                  {t('showOverview')}
                </ButtonTw>
              </div>
            </div>
          </form>
        </>
      )}
    </LayoutWrapper>
  )
}
