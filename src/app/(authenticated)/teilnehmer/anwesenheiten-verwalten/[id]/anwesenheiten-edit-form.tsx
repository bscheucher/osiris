'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { ParamValue } from 'next/dist/server/request/params'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import BadgeTw, { BadgeColor, BadgeSize } from '@/components/atoms/badge-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputRadioGroupTw from '@/components/atoms/input-radio-group-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import TooltipTw, { TooltipDirection } from '@/components/atoms/tooltip-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import { ROLE } from '@/lib/constants/role-constants'
import useUserStore from '@/stores/user-store'

export interface AnwesenheitEntry {
  id: number
  vorname: string
  nachname: string
  geburtsdatum: string
  status: string
  kursAnwesendPercent: number | null
  info: string | null
}

// Form data structure for React Hook Form
export interface AnwesenheitFormData {
  currentDay: string
  entries: {
    id: number
    vorname: string
    nachname: string
    geburtsdatum: string
    status: string
    kursAnwesendPercent: number | null
    info: string | null
    isDisabled?: boolean
  }[]
}

export interface TeilnahmeMetadata {
  seminarId: number
  bezeichnung: string
  projekt: string
  status: string
  changedOn: string
  changedBy: string | null
}

export interface TeilnahmeOverview {
  teilnahmeMetadata: TeilnahmeMetadata
  teilnehmers: AnwesenheitEntry[]
}

export interface AbwesenheitEditFormProps {
  seminarId: ParamValue
  dateParam: string | null
  metadata: TeilnahmeMetadata | null
  abwesenheitEntries: AnwesenheitEntry[]
  onSubmit: (formValues: AnwesenheitFormData) => Promise<void>
  isLoading: boolean
}

const STATUS_OPTIONS = [
  'Ausl',
  'B',
  'E',
  'F',
  'FE',
  'G',
  'K',
  'KSB',
  'PF',
  'P',
  'PD',
  'S',
  'SO',
  'U',
  'V',
  'ZE',
  'X',
  'NE',
]

const generateDateHeadline = (dateString?: string | null) => {
  if (!dateString) return ''

  const parsedDay = dayjs(dateString)

  return `${parsedDay.format('dddd')}, ${parsedDay.format('DD.MM.YYYY')}`
}

export default function AnwesenheitEditForm({
  seminarId,
  dateParam,
  metadata,
  abwesenheitEntries,
  onSubmit,
  isLoading,
}: AbwesenheitEditFormProps) {
  const t = useTranslations('anwesenheitenVerwalten.detail')
  const { hasSomeRole } = useUserStore()

  const router = useRouter()
  const [infoFieldIndex, setInfoFieldIndex] = useState<number | null>(null)

  const canEdit = hasSomeRole([
    ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
    ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
  ])

  const { control, register, handleSubmit, reset } =
    useForm<AnwesenheitFormData>({
      defaultValues: {
        currentDay: '',
        entries: [],
      },
    })

  const formValues = useWatch({ control })
  const { fields } = useFieldArray({
    control,
    name: 'entries',
  })

  const stats = useMemo(
    () => ({
      anwesend:
        formValues.entries?.filter((entry) => entry.status === 'X').length || 0,
      nichtEntschuldigt:
        formValues.entries?.filter((entry) => entry.status === 'NE').length ||
        0,
      sonstige:
        formValues.entries?.filter(
          (entry) =>
            !!entry.status && entry.status !== 'X' && entry.status !== 'NE'
        ).length || 0,
    }),
    [formValues]
  )

  const statusOptionsWithTranslations = useMemo(
    () =>
      STATUS_OPTIONS.map((key) => ({
        key,
        label: t(`status.${key}`),
      })),
    [t]
  )

  useEffect(() => {
    // Transform anwesenheitEntries to form data format on every update
    if (abwesenheitEntries.length > 0) {
      const formEntries = abwesenheitEntries.map((entry) => {
        // TODO: add isDisabled for status ['KSB', 'U', 'PF']
        // once admin abwesenheiten is done
        const isDisabled = !canEdit

        return {
          id: entry.id,
          nachname: entry.nachname,
          vorname: entry.vorname,
          geburtsdatum: entry.geburtsdatum,
          status: entry.status,
          kursAnwesendPercent: entry.kursAnwesendPercent,
          info: entry.info,
          isDisabled,
        }
      })

      reset({
        currentDay: dateParam || '',
        entries: formEntries,
      })
    }
  }, [abwesenheitEntries, canEdit, dateParam, reset])

  useEffect(() => {
    const formParam = dayjs(formValues.currentDay)

    if (seminarId && formValues.currentDay && formParam.isValid()) {
      router.replace(
        `/teilnehmer/anwesenheiten-verwalten/${seminarId}?date=${formParam.format('YYYY-MM-DD')}`
      )
    }
  }, [formValues.currentDay, router, seminarId])

  const renderInfoButton = useCallback(
    (index: number) => {
      const currentEntry = formValues.entries?.[index]
      const currentInfo = currentEntry?.info

      const button = (
        <ButtonTw
          onClick={() => {
            if (canEdit) {
              setInfoFieldIndex(index)
            }
          }}
          disabled={!canEdit}
        >
          <InformationCircleIcon className="size-5" />
        </ButtonTw>
      )

      return (
        <div className="flex items-center justify-center">
          {currentInfo ? (
            <TooltipTw
              content={<div className="break-normal">{currentInfo}</div>}
              direction={TooltipDirection.Top}
            >
              {button}
            </TooltipTw>
          ) : (
            button
          )}
        </div>
      )
    },
    [canEdit, formValues.entries]
  )

  const onPrevDayClick = () => {
    if (seminarId && dateParam && dayjs(dateParam).isValid()) {
      const nextDay = dayjs(dateParam).subtract(1, 'day').format('YYYY-MM-DD')
      router.push(
        `/teilnehmer/anwesenheiten-verwalten/${seminarId}?date=${nextDay}`
      )
    }
  }

  const onNextDayClick = () => {
    if (seminarId && dateParam && dayjs(dateParam).isValid()) {
      const nextDay = dayjs(dateParam).add(1, 'day').format('YYYY-MM-DD')
      router.push(
        `/teilnehmer/anwesenheiten-verwalten/${seminarId}?date=${nextDay}`
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col space-y-8">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2 className="block text-xl font-semibold tracking-tight text-gray-900">
                {generateDateHeadline(dateParam)}
              </h2>
              {metadata?.status === 'NEW' ? (
                <BadgeTw
                  className="justify-center"
                  size={BadgeSize.Large}
                  color={BadgeColor.Blue}
                >
                  {t('label.draft')}
                </BadgeTw>
              ) : (
                <BadgeTw
                  className="justify-center"
                  size={BadgeSize.Large}
                  color={BadgeColor.Green}
                >
                  {t('label.confirmed')}
                </BadgeTw>
              )}
            </div>
            {metadata?.changedOn && metadata?.changedBy && (
              <span className="text-md text-gray-500">
                {`${t('label.changeDescription', { changedBy: metadata?.changedBy })} ${dayjs(metadata.changedOn).format('DD.MM.YYYY')}`}
              </span>
            )}
          </div>
          <div className="flex flex-row gap-3">
            <ButtonTw
              type="button"
              secondary
              className="h-10"
              onClick={onPrevDayClick}
            >
              <ChevronLeftIcon className="size-5" />
            </ButtonTw>
            <div className="h-10 w-33">
              <DatepickerTw control={control} {...register('currentDay')} />
            </div>
            <ButtonTw
              type="button"
              secondary
              className="h-10"
              onClick={onNextDayClick}
            >
              <ChevronRightIcon className="size-5" />
            </ButtonTw>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-[1_1_50%] flex-row gap-8">
            <span className="text-md flex flex-col gap-2 text-gray-800">
              <div className="font-medium">{`${t('label.projekt')}:`}</div>
              <div className="text-gray-500">{metadata?.projekt}</div>
            </span>
            <span className="text-md flex flex-col gap-2 text-gray-800">
              <div className="font-medium">{`${t('label.seminar')}:`}</div>
              <div className="text-gray-500">{metadata?.bezeichnung}</div>
            </span>
          </div>
          <div className="flex flex-row gap-8">
            <span className="text-md flex flex-col gap-2 font-medium text-gray-800">
              <div>{t('label.anwesend')}</div>
              <BadgeTw
                className="h-8 w-10 justify-center"
                color={BadgeColor.Green}
              >
                {stats.anwesend}
              </BadgeTw>
            </span>
            <span className="text-md flex flex-col gap-2 font-medium text-gray-800">
              <div>{t('label.nichtEntschuldigt')}</div>
              <BadgeTw
                className="h-8 w-10 justify-center"
                color={BadgeColor.Red}
              >
                {stats.nichtEntschuldigt}
              </BadgeTw>
            </span>
            <span className="text-md flex flex-col gap-2 font-medium text-gray-800">
              <div>{t('label.sonstige')}</div>
              <BadgeTw
                className="h-8 w-10 justify-center"
                color={BadgeColor.Yellow}
              >
                {stats.sonstige}
              </BadgeTw>
            </span>
          </div>
        </div>
        <div className="flex">
          <TableTw className="flex-auto" testId="teilnehmer-table">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw>{t('table.nachname')}</TableHeaderTw>
                <TableHeaderTw>{t('table.vorname')}</TableHeaderTw>
                <TableHeaderTw>{t('table.geburtsDatum')}</TableHeaderTw>
                <TableHeaderTw>{t('table.an')}</TableHeaderTw>
                <TableHeaderTw>{t('table.ne')}</TableHeaderTw>
                <TableHeaderTw>{t('table.status')}</TableHeaderTw>
                <TableHeaderTw className="text-center">
                  {t('table.info')}
                </TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className={twMerge(field.isDisabled && 'bg-gray-100')}
                >
                  <TableCellTw>{field.nachname}</TableCellTw>
                  <TableCellTw>{field.vorname}</TableCellTw>
                  <TableCellTw>
                    {dayjs(field.geburtsdatum).format('YYYY.MM.DD')}
                  </TableCellTw>

                  <TableCellTw>
                    <InputRadioGroupTw
                      name={`entries.${index}.status`}
                      control={control}
                      options={[{ value: 'X' }]}
                      disabled={field.isDisabled}
                    />
                  </TableCellTw>
                  <TableCellTw>
                    <InputRadioGroupTw
                      name={`entries.${index}.status`}
                      control={control}
                      options={[{ value: 'NE' }]}
                      disabled={field.isDisabled}
                    />
                  </TableCellTw>
                  <TableCellTw>
                    <InputSelectTw
                      options={statusOptionsWithTranslations}
                      placeholder={t('placeholder.sonstige')}
                      name={`entries.${index}.status`}
                      control={control}
                      disabled={field.isDisabled}
                      className="max-w-[300px]"
                    />
                  </TableCellTw>
                  <TableCellTw>{renderInfoButton(index)}</TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
        </div>
        <div className="flex justify-end">
          <ButtonTw
            size={ButtonSize.XLarge}
            type="submit"
            className="flex gap-3"
            isLoading={isLoading}
            disabled={!canEdit}
          >
            <CheckIcon className="size-5 text-white" />
            {t('label.bestaetigen')}
          </ButtonTw>
        </div>
      </div>
      <DefaultModal
        showModal={infoFieldIndex !== null}
        closeModal={() => void setInfoFieldIndex(null)}
        modalSize="2xl"
      >
        <div className="flex flex-col space-y-8">
          <h3 className="mb-4 text-xl font-bold">{t('label.infoTitle')}</h3>
          <InfoSectionTw description={t('label.infoDescripton')} />
          <div>
            <TextareaTw
              name={`entries.${infoFieldIndex}.info`}
              label={t('placeholder.info')}
              control={control}
              rows={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between gap-6 border-t border-gray-200 pt-6">
            <ButtonTw
              onClick={() => void setInfoFieldIndex(null)}
              type="button"
              className="flex-auto"
              secondary
            >
              {t('label.schliessen')}
            </ButtonTw>
          </div>
        </div>
      </DefaultModal>
    </form>
  )
}
