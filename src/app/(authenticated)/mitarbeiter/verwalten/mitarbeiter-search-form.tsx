import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { BaseSyntheticEvent, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import {
  convertToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'

export interface MitarbeiterFormInputs {
  searchTerm?: string
  firma?: string
  kostenstelle?: string
  wohnort?: string
  beschaeftigungsstatus?: string
  jobbezeichnung?: string
  kategorie?: string
}

const DEFAULT_FORM_STATE = {
  searchTerm: '',
  firma: '',
  kostenstelle: '',
  wohnort: '',
  beschaeftigungsstatus: '',
  jobbezeichnung: '',
  kategorie: '',
}

const MitarbeiterSearchForm = () => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject, filterCount } = getSearchParamsObject(
    searchParams,
    DEFAULT_FORM_STATE
  )
  const t = useTranslations('mitarbeiter.verwalten')
  const { masterdataMA: masterdata } = useMasterdataStore()

  const [showFilters, setShowFilters] = useState<boolean>(false)
  const { register, handleSubmit, control, reset } =
    useForm<MitarbeiterFormInputs>({
      defaultValues: {
        ...DEFAULT_FORM_STATE,
        ...searchParamsObject,
      },
    })

  const resetHandler = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    reset(DEFAULT_FORM_STATE)
    updateSearchParams({
      ...DEFAULT_FORM_STATE,
      page: '',
    })
  }

  const submitHandler: SubmitHandler<MitarbeiterFormInputs> = async (
    data,
    e
  ) => {
    e?.preventDefault()
    updateSearchParams({
      page: '1',
      ...data,
    })
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid grid-cols-6 gap-x-3 gap-y-3">
          <div className="col-span-5">
            <InputTextTw
              placeholder={t('suche.platzhalter')}
              {...register('searchTerm')}
              control={control}
            />
          </div>
          <div className="col-span-1">
            <ButtonTw
              type="button"
              className="bg-ibis-emerald flex h-full w-full items-center justify-center gap-1 text-white ring-emerald-500 hover:bg-emerald-500"
              onClick={() => {
                setShowFilters(!showFilters)
              }}
              notificationCount={showFilters ? 0 : filterCount}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              {t('button.filter')}
            </ButtonTw>
          </div>
          {showFilters && (
            <>
              <div className="col-span-6">
                <HorizontalRow className="my-4" />
              </div>
              <div className="col-span-3">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(masterdata?.firmenList)}
                  placeholder={t('filter.firma')}
                  {...register('firma')}
                  testId="firma"
                />
              </div>
              <div className="col-span-3">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(
                    masterdata?.kostenstelleList
                  )}
                  placeholder={t('filter.kostenstelle')}
                  {...register('kostenstelle')}
                  testId="kostenstelle"
                />
              </div>
              <div className="col-span-3">
                <InputTextTw
                  placeholder={t('filter.wohnort')}
                  control={control}
                  {...register('wohnort')}
                  testId="wohnort"
                />
              </div>
              <div className="col-span-3">
                <InputSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(
                    masterdata?.beschaeftigungsstatusList
                  )}
                  placeholder={t('filter.beschaeftigungsstatus')}
                  {...register('beschaeftigungsstatus')}
                  testId="beschaeftigungsstatus"
                />
              </div>
              <div className="col-span-3">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(
                    masterdata?.jobbeschreibungList
                  )}
                  placeholder={t('filter.jobbezeichnung')}
                  {...register('jobbezeichnung')}
                  testId="jobbezeichnung"
                />
              </div>
              <div className="col-span-3">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(masterdata?.kategorieList)}
                  placeholder={t('filter.kategorie')}
                  {...register('kategorie')}
                  testId="kategorie"
                />
              </div>
            </>
          )}
          <div className="col-span-6">
            <HorizontalRow className="my-4" />
          </div>
          <div className="col-span-3">
            <ButtonTw
              type="button"
              className="h-full w-full"
              secondary
              onClick={resetHandler}
            >
              {t('button.reset')}
            </ButtonTw>
          </div>
          <div className="col-span-3">
            <ButtonTw type="submit" className="h-full w-full" testId="suchen">
              {t('button.suchen')}
            </ButtonTw>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MitarbeiterSearchForm
