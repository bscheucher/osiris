import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { BaseSyntheticEvent, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'
import {
  convertToKeyLabelOptions,
  getSearchParamsObject,
} from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'

export interface AnwesenheitVerwaltenFormInputs {
  identifiersString?: string
  project?: string
  seminar?: string
  isActive?: string
  kursEndeFrom?: string
  kursEndeTo?: string
  verzoegerung?: string
}

const DEFAULT_FORM_STATE = {
  identifiersString: '',
  project: '',
  seminar: '',
  isActive: '',
  kursEndeFrom: '',
  kursEndeTo: '',
  verzoegerung: '',
}

const IS_ACTIVE_KEY_LABEL = (t: (key: string) => string) => [
  { key: 'true', label: t('label.aktiv') },
  { key: 'false', label: t('label.nichtAktiv') },
]

const VERZOEGERUNG_KEY_LABEL = (t: (key: string) => string) => [
  { key: 'true', label: t('label.ja') },
  { key: 'false', label: t('label.nein') },
]

const AnwesenheitenSearchForm = () => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()
  const { searchParamsObject } = getSearchParamsObject(
    searchParams,
    DEFAULT_FORM_STATE
  )
  const t = useTranslations('anwesenheitenVerwalten')

  const { register, handleSubmit, control, reset, setValue } =
    useForm<AnwesenheitVerwaltenFormInputs>({
      defaultValues: {
        ...DEFAULT_FORM_STATE,
        ...searchParamsObject,
      },
    })
  const [projectValue, seminarValue, isActiveValue] = useWatch({
    control,
    name: ['project', 'seminar', 'isActive'],
  })

  const [projectList, setProjectList] = useState<string[]>([])
  const [seminarList, setSeminarList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useAsyncEffect(async () => {
    try {
      setIsLoading(true)
      const { data } = await executeGET<{ projekt: string[] }>(
        `/projekt/getProjektsByStatus${toQueryString({ isActive: isActiveValue })}`
      )
      if (data?.projekt) {
        setProjectList(data?.projekt)
      }

      if (!data?.projekt.includes(projectValue as string)) {
        setValue('project', '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isActiveValue])

  useAsyncEffect(async () => {
    try {
      setIsLoading(true)
      const { data } = await executeGET<{ seminars: string[] }>(
        `/seminar/getSeminarsByStatus${toQueryString({
          projectName: projectValue || '',
          isActive: isActiveValue || undefined,
        })}`
      )
      if (data?.seminars) {
        setSeminarList(data.seminars)
      }

      if (!data?.seminars.includes(seminarValue as string)) {
        setValue('seminar', '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectValue, isActiveValue])

  const submitHandler: SubmitHandler<AnwesenheitVerwaltenFormInputs> = async (
    data
  ) => {
    // Update URL with form values and reset page url prop
    updateSearchParams({
      ...data,
      page: '',
    })
  }

  const resetHandler = (e: BaseSyntheticEvent) => {
    reset(DEFAULT_FORM_STATE)
    updateSearchParams({
      ...DEFAULT_FORM_STATE,
      isActive: '',
      page: '',
    })
  }

  return (
    <div className="relative mb-8">
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid grid-cols-12 gap-x-3 gap-y-3">
          <div className="col-span-4">
            <ComboSelectTw
              label={t('label.projekt')}
              placeholder={t('placeholder.projekt')}
              options={convertToKeyLabelOptions(projectList)}
              disabled={isLoading}
              control={control}
              {...register('project')}
              testId="projekt"
            />
          </div>
          <div className="col-span-4">
            <ComboSelectTw
              label={t('label.seminar')}
              placeholder={t('placeholder.seminar')}
              options={convertToKeyLabelOptions(seminarList)}
              disabled={isLoading}
              control={control}
              {...register('seminar')}
              testId="seminar"
            />
          </div>
          <div className="col-span-4">
            <InputSelectTw
              label={t('label.aktiv')}
              placeholder={t('placeholder.aktiv')}
              control={control}
              options={IS_ACTIVE_KEY_LABEL(t)}
              disabled={isLoading}
              {...register('isActive')}
              testId="aktiv"
            />
          </div>
          <div className="col-span-4">
            <DatepickerTw
              label={t('label.kursEndeFrom')}
              placeholder={t('placeholder.kursEndeFrom')}
              control={control}
              disabled={isLoading}
              {...register('kursEndeFrom')}
              testId="kursEndeFrom"
            />
          </div>
          <div className="col-span-4">
            <DatepickerTw
              label={t('label.kursEndeTo')}
              placeholder={t('placeholder.kursEndeTo')}
              control={control}
              disabled={isLoading}
              {...register('kursEndeTo')}
              testId="kursEndeTo"
            />
          </div>
          <div className="col-span-4">
            <InputSelectTw
              label={t('label.verzoegerung')}
              placeholder={t('placeholder.verzoegerung')}
              control={control}
              options={VERZOEGERUNG_KEY_LABEL(t)}
              disabled={isLoading}
              {...register('verzoegerung')}
              testId="verzoegerung"
            />
          </div>
          <div className="col-span-12">
            <HorizontalRow className="my-4" />
          </div>
          <div className="col-span-6">
            <ButtonTw
              type="button"
              className="h-full w-full"
              secondary
              onClick={resetHandler}
              testId="tn-reset"
            >
              {t('label.zuruecksetzen')}
            </ButtonTw>
          </div>
          <div className="col-span-6">
            <ButtonTw
              type="submit"
              className="h-full w-full"
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

export default AnwesenheitenSearchForm
