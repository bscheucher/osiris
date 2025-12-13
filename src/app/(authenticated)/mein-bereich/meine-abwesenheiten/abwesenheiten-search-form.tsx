import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import InputSelectTw from '@/components/atoms/input-select-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import { AbwesenheitStatus } from '@/lib/utils/abwesenheit-utils'
import {
  convertEnumToKeyLabelOptions,
  convertToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'

export interface AbwesenheitenFormInputs {
  status?: string
  year?: string
}

export interface AbwesenheitenSearchFormProps {
  yearOptions: string[]
  isLoading: boolean
}

const AbwesenheitenSearchForm: React.FC<AbwesenheitenSearchFormProps> = ({
  yearOptions,
  isLoading,
}) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)

  const t = useTranslations('meineAbwesenheiten')
  const tCommon = useTranslations('common')
  const { register, handleSubmit, control, watch } =
    useForm<AbwesenheitenFormInputs>({
      defaultValues: searchParamsObject,
    })

  const submitForm = handleSubmit((data: AbwesenheitenFormInputs, event) => {
    event?.preventDefault()
    updateSearchParams({
      ...data,
      page: '',
    })
  })

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name === 'status' || name === 'year') {
        submitForm()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch, submitForm])

  return (
    <div className="relative">
      <form>
        <div className="grid grid-cols-6 gap-x-3 gap-y-3">
          <>
            <div className="col-span-2">
              <InputSelectTw
                control={control}
                placeholder={t('overview.filter.status')}
                disabled={isLoading}
                options={convertEnumToKeyLabelOptions(
                  AbwesenheitStatus,
                  tCommon,
                  'abwesenheitsstatus'
                ).sort((a, b) => a.label.localeCompare(b.label))}
                {...register('status')}
                testId="status"
              />
            </div>
            <div className="col-span-1">
              <InputSelectTw
                control={control}
                disabled={isLoading}
                placeholder={t('overview.filter.year')}
                options={convertToKeyLabelOptions(yearOptions)}
                {...register('year')}
                testId="year"
              />
            </div>
          </>
        </div>
      </form>
    </div>
  )
}

export default AbwesenheitenSearchForm
