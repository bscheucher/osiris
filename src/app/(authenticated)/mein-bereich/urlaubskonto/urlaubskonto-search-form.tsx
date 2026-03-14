import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import { toQueryString } from '@/lib/utils/gateway-utils'

export interface UrlaubskontoFormInputs {
  startDate?: string
  endDate?: string
}

const UrlaubskontoSearchForm = ({
  startDate,
  endDate,
  isLoading,
}: {
  startDate: string
  endDate: string
  isLoading: boolean
}) => {
  const router = useRouter()
  const t = useTranslations('urlaubsKonto.overview.searchform')
  const { handleSubmit, control, reset, watch } =
    useForm<UrlaubskontoFormInputs>({
      values: {
        startDate,
        endDate,
      },
    })

  const onSubmit = (formValues: UrlaubskontoFormInputs) => {
    router.push(`/mein-bereich/urlaubskonto/${toQueryString(formValues)}`)
  }

  const onReset = () => {
    reset({ startDate: '', endDate: '' })
    router.push(`/mein-bereich/urlaubskonto`)
  }

  return (
    <div className="relative mb-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-6 gap-4 xl:grid-cols-12">
          <div className="col-span-3">
            <DatepickerTw
              label={t('labels.startDate')}
              placeholder={t('placeholder.startDate')}
              control={control}
              name="startDate"
              disabled={isLoading}
            />
          </div>
          <div className="col-span-3">
            <DatepickerTw
              label={t('labels.endDate')}
              placeholder={t('placeholder.endDate')}
              control={control}
              name="endDate"
              minDate={dayjs(watch('startDate')).toDate()}
              disabled={isLoading}
            />
          </div>
          <div className="col-span-3 flex">
            <ButtonTw
              type="button"
              isLoading={isLoading}
              className="w-full self-end"
              size={ButtonSize.Large}
              onClick={onReset}
              secondary
            >
              {t('labels.reset')}
            </ButtonTw>
          </div>
          <div className="col-span-3 flex">
            <ButtonTw
              type="submit"
              isLoading={isLoading}
              className="w-full self-end"
              size={ButtonSize.Large}
            >
              {t('labels.show')}
            </ButtonTw>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UrlaubskontoSearchForm
