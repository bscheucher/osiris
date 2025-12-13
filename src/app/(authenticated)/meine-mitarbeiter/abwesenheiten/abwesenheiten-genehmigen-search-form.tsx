import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import InputSelectTw from '@/components/atoms/input-select-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import { AbwesenheitStatus } from '@/lib/utils/abwesenheit-utils'
import {
  convertEnumToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'

export interface AbwesenheitenFormInputs {
  status?: string
}

const AbwesenheitenGenehmigenSearchForm: React.FC<{
  isLoading: boolean
}> = ({ isLoading }) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)

  const t = useTranslations('abwesenheitenGenehmigen')
  const tCommon = useTranslations('common')
  const { register, control } = useForm<AbwesenheitenFormInputs>({
    defaultValues: searchParamsObject,
  })
  const formValues = useWatch({ control })

  useEffect(() => {
    updateSearchParams({
      ...formValues,
      page: '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues])

  return (
    <div className="relative mb-8">
      <form>
        <div className="grid grid-cols-6 gap-x-3 gap-y-3">
          <>
            <div className="col-span-2">
              <InputSelectTw
                control={control}
                placeholder={t('placeholder.status')}
                disabled={isLoading}
                options={convertEnumToKeyLabelOptions(
                  AbwesenheitStatus,
                  tCommon,
                  'abwesenheitsstatus'
                )}
                {...register('status')}
                testId="status"
              />
            </div>
          </>
        </div>
      </form>
    </div>
  )
}

export default AbwesenheitenGenehmigenSearchForm
