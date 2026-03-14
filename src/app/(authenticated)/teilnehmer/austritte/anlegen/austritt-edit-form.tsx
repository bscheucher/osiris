import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useMemo, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw/index'
import InputSelectTw from '@/components/atoms/input-select-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import {
  TeilnehmerSearchTw,
  SelectedEntry,
} from '@/components/molecules/teilnehmer-search-tw'
import { ConfirmModal } from '@/components/organisms/confirm-modal'
import { Austritt, AustrittsgrundType } from '@/lib/utils/austritte-utils'
import { convertEnumToKeyLabelOptions } from '@/lib/utils/form-utils'
import { executePOST } from '@/lib/utils/gateway-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'

type FormValues = {
  teilnehmerId: number | null
  austrittsDatum: string
  austrittsgrund: string
  bemerkung: string
}

export const createSchema = (t: (key: string) => string) =>
  yup.object({
    teilnehmerId: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required(t('required.teilnehmer')),
    austrittsDatum: yup.string().required(t('required.austrittsDatum')),
    austrittsgrund: yup
      .string()
      .nullable()
      .required(t('required.austrittsgrund')),
    bemerkung: yup.string().nullable(),
  })

const AustrittEditForm = ({
  mode,
  austritt,
}: {
  mode?: 'create' | 'edit'
  austritt?:
    | (Pick<Austritt, 'teilnehmerId' | 'vorname' | 'nachname' | 'svNummer'> &
        Partial<Austritt>)
    | null
}) => {
  const router = useRouter()
  const t = useTranslations('teilnehmerAustritte.anlegen')

  const [isLoading, setIsLoading] = useState(false)

  const schema = useMemo(() => createSchema(t), [t])

  const {
    handleSubmit,
    clearErrors,
    control,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      teilnehmerId: austritt?.teilnehmerId || null,
      austrittsDatum: austritt?.austrittsDatum || '',
      austrittsgrund: austritt?.austrittsgrund || '',
      bemerkung: austritt?.bemerkung || '',
    },
  })

  // format austritt dto to match selected entry for TN search
  const selectedEntry = useMemo(
    () =>
      austritt?.teilnehmerId &&
      austritt?.vorname &&
      austritt?.nachname &&
      austritt?.svNummer
        ? ({
            vorname: austritt.vorname,
            nachname: austritt.nachname,
            svNummer: austritt.svNummer.toString(),
            id: austritt.teilnehmerId,
          } satisfies SelectedEntry)
        : undefined,
    [austritt]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (formValues) => {
      setIsLoading(true)
      clearErrors()
      try {
        const response = await executePOST<{
          uebaAbmeldungen: Austritt[]
        }>(`/teilnehmer/submitUebaAbmeldung`, formValues)

        if (!response.success) {
          throw new Error(t('error.save'))
        } else {
          router.push('/teilnehmer/austritte')
          showSuccess(t('message.success.save'))
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    },
    [clearErrors, t, router]
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8 grid grid-cols-4 gap-x-8 gap-y-8">
          <div className="col-span-4">
            <TeilnehmerSearchTw
              selectedEntry={selectedEntry}
              disabled={!!selectedEntry}
              label={t('teilnehmer')}
              placeholder={t('placeholder.teilnehmer')}
              control={control}
              schema={schema}
              name={'teilnehmerId'}
            />
          </div>
          <div className="col-span-4">
            <DatepickerTw
              label={t('austrittsDatum')}
              placeholder={t('placeholder.austrittsDatum')}
              control={control}
              schema={schema}
              name={'austrittsDatum'}
            />
          </div>
          <div className="col-span-4">
            <InputSelectTw
              label={t('austrittsgrund')}
              options={convertEnumToKeyLabelOptions(
                AustrittsgrundType,
                t,
                'austrittsgrundType'
              )}
              placeholder={t('placeholder.austrittsgrund')}
              control={control}
              schema={schema}
              name={'austrittsgrund'}
            />
          </div>
          <div className="col-span-4">
            <TextareaTw
              className="w-full"
              label={t('bemerkung')}
              placeholder={t('placeholder.bemerkung')}
              rows={10}
              control={control}
              schema={schema}
              name={'bemerkung'}
            />
          </div>
          <div className="col-span-2">
            <ButtonTw
              href="/teilnehmer/austritte"
              type="button"
              className="h-full w-full"
              disabled={isLoading}
              isLoading={isLoading}
              secondary
            >
              {t('cancel')}
            </ButtonTw>
          </div>
          <div className="col-span-2">
            <ButtonTw
              type="submit"
              className="h-full w-full"
              size={ButtonSize.XLarge}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {mode === 'create' ? t('create') : t('edit')}
            </ButtonTw>
          </div>
        </div>
      </form>
      <ConfirmModal condition={isDirty && !isLoading} />
    </>
  )
}

export default AustrittEditForm
