import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { BaseSyntheticEvent, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import {
  convertToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

export interface TeilnehmerFormInputs {
  identifiersString?: string
  projectName?: string
  seminarName?: string
  massnahmennummer?: string
  geschlecht?: string
  isUebaTeilnehmer?: string
  isAngemeldet?: string
  isActive?: string
}

const DEFAULT_FORM_STATE = {
  identifiersString: '',
  projectName: '',
  seminarName: '',
  massnahmennummer: '',
  geschlecht: '',
  isActive: '',
  isUebaTeilnehmer: '',
  isAngemeldet: '',
}

const TeilnehmerSearchForm = ({
  isKorrigieren,
}: {
  isKorrigieren?: boolean
}) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject, filterCount } = getSearchParamsObject(
    searchParams,
    DEFAULT_FORM_STATE
  )
  const { masterdataTN: masterdata } = useMasterdataStore()
  const t = useTranslations('teilnehmer.verwalten')

  const { register, handleSubmit, control, reset, setValue } =
    useForm<TeilnehmerFormInputs>({
      defaultValues: {
        ...DEFAULT_FORM_STATE,
        ...searchParamsObject,
      },
    })

  const {
    projectName: projectNameValue,
    seminarName: seminarNameValue,
    massnahmennummer: massnahmennummerValue,
    isActive: isActiveValue,
    isAngemeldet: isAngemeldetValue,
  } = useWatch({
    control,
  })

  const [projectList, setProjectList] = useState<string[]>([])
  const [seminarList, setSeminarList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [massnahmennummerList, setMassnahmennummerList] = useState<string[]>([])

  useAsyncEffect(async () => {
    try {
      setIsLoading(true)

      // Prepare all requests
      const seminarRequest = executeGET<{ seminars: string[] }>(
        `/seminar/getSeminarsByStatus${toQueryString({
          projectName: projectNameValue || '',
          isActive: isActiveValue || isAngemeldetValue || undefined,
          isKorrigieren,
          massnahmennummer: massnahmennummerValue || '',
        })}`
      )

      const projektRequest = executeGET<{ projekt: string[] }>(
        `/projekt/getProjektsByStatus${toQueryString({ isActive: isActiveValue, isKorrigieren })}`
      )

      const massnahmenRequest = isKorrigieren
        ? executeGET<{ massnahmenummer: string[] }>(`/seminar/massnahmenummer`)
        : null

      const [seminarResponse, projektResponse, massnahmenResponse] =
        await Promise.all([seminarRequest, projektRequest, massnahmenRequest])

      if (seminarResponse.data?.seminars) {
        setSeminarList(seminarResponse.data.seminars)
      }

      if (
        !seminarResponse.data?.seminars.includes(seminarNameValue as string)
      ) {
        setValue('seminarName', '')
      }

      if (projektResponse.data?.projekt) {
        setProjectList(projektResponse.data.projekt)
      }

      if (!projektResponse.data?.projekt.includes(projectNameValue as string)) {
        setValue('projectName', '')
      }

      if (massnahmenResponse?.data?.massnahmenummer?.length) {
        setMassnahmennummerList(massnahmenResponse.data.massnahmenummer)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectNameValue, isActiveValue, isAngemeldetValue])

  const submitHandler: SubmitHandler<TeilnehmerFormInputs> = async (data) => {
    // Update URL with form values and reset page url prop
    updateSearchParams({
      page: '1',
      ...data,
    })
  }

  const resetHandler = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    reset(DEFAULT_FORM_STATE)
    updateSearchParams({
      ...DEFAULT_FORM_STATE,
      isAngemeldet: '',
      page: '',
    })
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid grid-cols-6 gap-x-3 gap-y-3">
          <div className="col-span-5">
            <InputTextTw
              placeholder={t('suche.platzhalter')}
              {...register('identifiersString')}
              autoFocus
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
              testId="tn-filter-button"
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
              <div className="col-span-3 2xl:col-span-2">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(projectList)}
                  placeholder={t('select.projekt')}
                  disabled={isLoading}
                  {...register('projectName')}
                  testId="projectName"
                />
              </div>
              <div className="col-span-3 2xl:col-span-2">
                <ComboSelectTw
                  control={control}
                  options={convertToKeyLabelOptions(seminarList)}
                  placeholder={t('select.seminar')}
                  disabled={isLoading}
                  {...register('seminarName')}
                  testId="seminarName"
                />
              </div>
              {isKorrigieren && (
                <div className="col-span-3 2xl:col-span-2">
                  <ComboSelectTw
                    control={control}
                    options={convertToKeyLabelOptions(massnahmennummerList)}
                    placeholder={t('select.massnahmennummer')}
                    disabled={isLoading}
                    {...register('massnahmennummer')}
                    testId="massnahmennummer"
                  />
                </div>
              )}
              <div className="col-span-3 2xl:col-span-2">
                <InputSelectTw
                  control={control}
                  disabled={isLoading}
                  placeholder={t('uebaTeilnehmerOption.all')}
                  options={[
                    { key: 'true', label: t('uebaTeilnehmerOption.only_ueba') },
                    {
                      key: 'false',
                      label: t('uebaTeilnehmerOption.only_non_ueba'),
                    },
                  ]}
                  {...register('isUebaTeilnehmer')}
                  testId="isUebaTeilnehmer"
                />
              </div>
              <div className="col-span-3 2xl:col-span-2">
                <InputSelectTw
                  control={control}
                  disabled={isLoading}
                  placeholder={t('placeholder.isActive')}
                  options={[
                    { key: 'true', label: t('label.isActiveTrue') },
                    {
                      key: 'false',
                      label: t('label.isActiveFalse'),
                    },
                  ]}
                  {...register('isActive')}
                  testId="isActive"
                />
              </div>
              <div className="col-span-3 2xl:col-span-2">
                <InputSelectTw
                  options={convertToKeyLabelOptions(masterdata?.geschlechtList)}
                  placeholder={t('select.geschlecht')}
                  disabled={isLoading}
                  control={control}
                  {...register('geschlecht')}
                />
              </div>

              <div className="col-span-3 2xl:col-span-2">
                <InputSelectTw
                  control={control}
                  disabled={isLoading}
                  placeholder={t('placeholder.isAngemeldet')}
                  options={[
                    { key: 'true', label: t('label.isAngemeldetTrue') },
                    {
                      key: 'false',
                      label: t('label.isAngemeldetFalse'),
                    },
                  ]}
                  {...register('isAngemeldet')}
                  testId="isAngemeldet"
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
              isLoading={isLoading}
              secondary
              onClick={resetHandler}
              testId="tn-reset"
            >
              {t('button.reset')}
            </ButtonTw>
          </div>
          <div className="col-span-3">
            <ButtonTw
              type="submit"
              className="h-full w-full"
              isLoading={isLoading}
              testId="tn-search"
            >
              {t('button.suchen')}
            </ButtonTw>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TeilnehmerSearchForm
