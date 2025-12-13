import debounce from 'lodash/debounce'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'

export interface VertragsaenderungenFormInputs {
  status: string
  searchTerm?: string
}

export interface VertragsaenderungenFormProps {
  isLoading?: boolean
}

const VertragsaenderungenSearchForm: React.FC<VertragsaenderungenFormProps> = ({
  isLoading,
}) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)
  const t = useTranslations('mitarbeiterVertragsaenderungen.overview')
  const { masterdataMA: masterdata } = useMasterdataStore()

  const { register, handleSubmit, control, watch } =
    useForm<VertragsaenderungenFormInputs>({
      defaultValues: searchParamsObject,
    })

  const submitForm = handleSubmit(
    (data: VertragsaenderungenFormInputs, event) => {
      event?.preventDefault()

      updateSearchParams({
        ...data,
        page: '',
      })
    }
  )

  const statusOptions = useMemo(() => {
    const statusOptions =
      masterdata?.vertragsaenderungStatusesList
        .map((status) => ({
          key: status,
          label: t(`vertragsaenderungsstatus.${status.toLowerCase()}`),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) || []

    return [
      { key: 'ALL', label: t(`vertragsaenderungsstatus.all`) },
      { key: 'OPEN', label: t(`vertragsaenderungsstatus.open`) },
      ...statusOptions,
    ]
  }, [masterdata?.vertragsaenderungStatusesList, t])

  useEffect(() => {
    const handleDebouncedSubmit = debounce((searchTerm: string) => {
      if (searchTerm.length >= 4 || searchTerm.length === 0) {
        submitForm()
      }
    }, 300)

    const subscription = watch((value, { name }) => {
      if (name === 'searchTerm') {
        handleDebouncedSubmit(value.searchTerm || '')
      } else if (name === 'status') {
        submitForm()
      }
    })

    return () => {
      subscription.unsubscribe()
      handleDebouncedSubmit.cancel()
    }
  }, [watch, submitForm])

  return (
    <div className="relative">
      <form>
        <div className="grid grid-cols-6 gap-x-3 gap-y-3">
          <div className="col-span-4">
            <InputTextTw
              placeholder={t('filter.suche')}
              {...register('searchTerm')}
              control={control}
              testId="searchTerm"
              disabled={isLoading}
            />
          </div>
          <div className="col-span-2">
            <InputSelectTw
              control={control}
              options={statusOptions}
              {...register('status')}
              testId="status"
              disabled={isLoading || !statusOptions.length}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default VertragsaenderungenSearchForm
