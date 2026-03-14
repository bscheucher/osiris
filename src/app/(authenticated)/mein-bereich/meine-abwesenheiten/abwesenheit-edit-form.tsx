import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw/index'
import InputSelectTw from '@/components/atoms/input-select-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import { ConfirmModal } from '@/components/organisms/confirm-modal'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import {
  AbwesenheitEntry,
  AbwesenheitStatus,
  AbwesenheitType,
} from '@/lib/utils/abwesenheit-utils'
import { convertEnumToKeyLabelOptions } from '@/lib/utils/form-utils'
import { executePOST } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'

type FormValues = {
  startDate: string
  endDate: string
  type: AbwesenheitType | ''
  comment?: string
}

export const createSchema = (t: (key: string) => string) =>
  yup.object({
    startDate: yup.string().required(t('startDateRequired')),
    endDate: yup.string().required(t('endDateRequired')),
    type: yup.string().required(t('typRequired')),
    comment: yup.string().nullable(),
  })

const AbwesenheitEditForm = ({
  abwesenheit,
}: {
  abwesenheit?: AbwesenheitEntry
}) => {
  const router = useRouter()
  const t = useTranslations('meineAbwesenheiten.create')
  const schema = useMemo(() => createSchema(t), [t])
  const [isLoading, setIsLoading] = useState(false)
  const [getOverride, setOverride] = useFormEffectOverrides()

  const {
    register,
    handleSubmit,
    clearErrors,
    control,
    setValue,
    watch,
    formState,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      startDate: abwesenheit?.startDate ?? '',
      endDate: abwesenheit?.endDate ?? '',
      type: abwesenheit?.type ?? '',
      comment: abwesenheit?.comment ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true)
    clearErrors()

    try {
      const response = await executePOST<{
        abwesenheit: AbwesenheitEntry[]
      }>(`/zeiterfassung/abwesenheiten/edit`, data)

      if (!response.success) {
        if (!response.message) {
          showError(t('error.laden'))
        }
        return
      }

      const updatedAbwesenheit = response.data?.abwesenheit[0]

      if (!updatedAbwesenheit) {
        throw new Error('Speichern fehlgeschlagen.')
      } else {
        if (updatedAbwesenheit.status === AbwesenheitStatus.INVALID) {
          showError(t('error.invalid'))
        } else if (updatedAbwesenheit.status === AbwesenheitStatus.ERROR) {
          showError(t('error.laden'))
        } else {
          showSuccess(t('message.success.save'))
        }
      }
    } catch (e) {
      showError(t('error.laden'))
    } finally {
      router.push('/mein-bereich/meine-abwesenheiten')
    }
  }

  useFormEffect<FormValues>(
    {
      startDate: (value) => {
        if (value) {
          const inputDate = dayjs(value).startOf('day')
          setOverride('endDate', {
            minDate: inputDate.toDate(),
          })

          const endDate = watch('endDate')
          if (value && endDate && dayjs(value).isAfter(dayjs(endDate))) {
            setValue('endDate', '')
          }
        } else {
          setOverride('endDate', {
            minDate: null,
          })
        }
      },
    },
    watch,
    setValue
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <DatepickerTw
              label={t('startDate')}
              placeholder={t('startDatePlaceholder')}
              control={control}
              required
              {...register('startDate')}
            />
          </div>
          <div className="sm:col-span-2">
            <DatepickerTw
              label={t('endDate')}
              placeholder={t('endDatePlaceholder')}
              control={control}
              required
              {...register('endDate')}
              {...getOverride('endDate')}
            />
          </div>
          <div className="sm:col-span-4">
            <InputSelectTw
              label={t('typ')}
              options={convertEnumToKeyLabelOptions(
                AbwesenheitType,
                t,
                'abwesenheitsType'
              )}
              placeholder={t('typPlaceholder')}
              control={control}
              schema={schema}
              name="type"
              required
            />
          </div>
          <div className="sm:col-span-4">
            <TextareaTw
              className="w-full"
              label={t('comment')}
              placeholder={t('commentPlaceholder')}
              rows={10}
              control={control}
              maxLength={250}
              {...register('comment')}
            />
          </div>
          <div className="col-span-2">
            <ButtonTw
              type="button"
              className="h-full w-full"
              disabled={isLoading}
              isLoading={isLoading}
              href="/mein-bereich/meine-abwesenheiten"
              secondary
            >
              {t('button.cancel')}
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
              {t('button.create')}
            </ButtonTw>
          </div>
        </div>
      </form>
      <ConfirmModal condition={formState.isDirty && !isLoading} />
    </>
  )
}

export default AbwesenheitEditForm
