import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { BaseSyntheticEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { VereinbarungsStatus } from './vereinbarungen-utils'
import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import {
  convertEnumToKeyLabelOptions,
  convertToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'

export interface VereinbarungenFormInputs {
  status?: string
  firma?: string
  searchTerm?: string
}

const DEFAULT_FORM_STATE = {
  status: '',
  firma: '',
  searchTerm: '',
}

const VereinbarungenSearchForm = () => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const t = useTranslations('mitarbeiterVereinbarungen.overview')
  const { masterdataMA: masterdata } = useMasterdataStore()
  const [isLoading] = useState<boolean>(false)

  const { register, handleSubmit, control, reset } =
    useForm<VereinbarungenFormInputs>({
      defaultValues: DEFAULT_FORM_STATE,
    })

  useEffect(() => {
    const { searchParamsObject } = getSearchParamsObject(
      searchParams,
      DEFAULT_FORM_STATE
    )

    // Populate form values from URL on initial load or hard refresh
    reset(searchParamsObject)
  }, [searchParams, reset])

  const submitHandler = (data: VereinbarungenFormInputs) => {
    updateSearchParams({
      ...data,
      page: '',
    })
  }

  const resetHandler = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    reset(DEFAULT_FORM_STATE)
    updateSearchParams({
      ...DEFAULT_FORM_STATE,
      page: '',
    })
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid grid-cols-12 gap-x-3 gap-y-3">
          <div className="col-span-12">
            <InputTextTw
              placeholder={t('placeholder.searchTerm')}
              {...register('searchTerm')}
              control={control}
            />
          </div>
          <div className="col-span-6">
            <InputSelectTw
              control={control}
              options={convertEnumToKeyLabelOptions(
                VereinbarungsStatus,
                t,
                'vereinbarungsStatus'
              ).map((option) => ({
                ...option,
                key: option.key.toLowerCase(),
              }))}
              placeholder={t('placeholder.status')}
              testId="status"
              {...register('status')}
            />
          </div>
          <div className="col-span-6">
            <ComboSelectTw
              control={control}
              options={convertToKeyLabelOptions(masterdata?.firmenList)}
              placeholder={t('placeholder.firma')}
              {...register('firma')}
              testId="firma"
            />
          </div>
          <div className="col-span-12">
            <HorizontalRow className="my-4" />
          </div>
          <div className="col-span-6">
            <ButtonTw
              type="button"
              className="h-full w-full"
              isLoading={isLoading}
              secondary
              onClick={resetHandler}
              testId="tn-reset"
            >
              {t('label.reset')}
            </ButtonTw>
          </div>
          <div className="col-span-6">
            <ButtonTw
              type="submit"
              className="h-full w-full"
              isLoading={isLoading}
              testId="tn-search"
            >
              {t('label.suchen')}
            </ButtonTw>
          </div>
        </div>
      </form>
    </div>
  )
}

export default VereinbarungenSearchForm
