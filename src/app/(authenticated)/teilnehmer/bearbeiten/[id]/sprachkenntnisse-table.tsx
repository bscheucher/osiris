import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import {
  Teilnehmer,
  TeilnehmerSprachkenntnis,
} from '@/lib/interfaces/teilnehmer'
import {
  convertArrayToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import {
  ErrorsResponse,
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

const DEFAULT_VALUES = {
  sprache: 'Deutsch',
  niveau: '',
  bewertungCoach: '',
  bewertungDatum: '',
}

// "Deutsch" should be the only option here
const SPRACHKENNTNISSE_OPTIONS = [{ key: 'Deutsch', label: 'Deutsch' }]

const SprachkenntnisseTable: React.FC<{
  participant: Teilnehmer
  isReadOnly?: boolean
  setParticipant?: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
}> = ({ isReadOnly, participant }) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sprachkenntnisse, setSprachkenntnisse] = useState<
    TeilnehmerSprachkenntnis[]
  >([])
  const [selectedSprachkenntnis, setSelectedSprachkenntnis] =
    useState<TeilnehmerSprachkenntnis | null>(null)
  const { masterdataTN: masterdata } = useMasterdataStore()

  const {
    clearErrors,
    register,
    reset,
    control,
    getValues,
    watch,
    setValue,
    setError,
  } = useForm<TeilnehmerSprachkenntnis>({
    defaultValues: DEFAULT_VALUES,
  })

  const [getOverride, setOverride] = useFormEffectOverrides()

  useFormEffect<TeilnehmerSprachkenntnis>(
    {
      bewertungCoach: (value) => {
        setOverride('bewertungDatum', { required: !!value })
      },
    },
    watch,
    setValue
  )

  useAsyncEffect(async () => {
    setIsLoading(true)
    const { data } = await executeGET<{
      teilnehmerSprachkenntnis: TeilnehmerSprachkenntnis[]
    }>(`/teilnehmer/${participant.id}/sprachkenntnisse`)

    if (data?.teilnehmerSprachkenntnis) {
      setSprachkenntnisse(data.teilnehmerSprachkenntnis)
    }
    setIsLoading(false)
  }, [])

  const onSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    const data = getValues()
    if (data) {
      addSprachkenntnis(data)
    }
  }

  const addSprachkenntnis = async (
    sprachkenntnis: Omit<TeilnehmerSprachkenntnis, 'id'>
  ) => {
    clearErrors()
    setIsLoading(true)

    const { data } = await executePOST<{
      teilnehmerSprachkenntnis: Array<TeilnehmerSprachkenntnis & ErrorsResponse>
    }>(`/teilnehmer/edit/${participant.id}/sprachkenntnis`, sprachkenntnis)

    const currentTeilnehmerSprachkenntnis = data?.teilnehmerSprachkenntnis[0]

    if (currentTeilnehmerSprachkenntnis) {
      clearErrors()

      if (
        currentTeilnehmerSprachkenntnis.errors?.length &&
        currentTeilnehmerSprachkenntnis.errorsMap
      ) {
        setErrorsFromErrorsMap(
          currentTeilnehmerSprachkenntnis.errorsMap,
          setError
        )
      } else {
        setSprachkenntnisse([
          ...sprachkenntnisse,
          currentTeilnehmerSprachkenntnis,
        ])
        reset()
      }
    }

    setIsLoading(false)
  }

  const onDeleteSprachkenntnis = async (
    sprachkenntnis: TeilnehmerSprachkenntnis
  ) => {
    setIsLoading(true)
    const { success } = await executeDELETE<{
      teilnehmerSprachkenntnis: TeilnehmerSprachkenntnis[]
    }>(`/teilnehmer/delete/sprachkenntnis/${sprachkenntnis.id}`)

    if (success) {
      const updatedSprachkenntnisse = sprachkenntnisse?.filter(
        (item) => item.id !== sprachkenntnis.id
      )
      setSprachkenntnisse(updatedSprachkenntnisse || [])
    }
    setIsLoading(false)
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-6">
      <div className="col-span-12">
        <h3 className="text-base leading-7 font-semibold text-gray-900">
          {t('label.sprachkenntnisse')}
        </h3>
      </div>
      {sprachkenntnisse.length > 0 && (
        <>
          <div className="col-span-12">
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`label.sprache`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.niveau`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.bewertungCoach`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.pruefungAm`)}</TableHeaderTw>
                  <TableHeaderTw>{` `}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sprachkenntnisse.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <TableCellTw testId="sprachkenntnis-td-sprache">
                      {entry.sprache}
                    </TableCellTw>
                    <TableCellTw testId="sprachkenntnis-td-niveau">
                      {entry.niveau}
                    </TableCellTw>
                    <TableCellTw testId="sprachkenntnis-td-bewertungCoach">
                      {entry.bewertungCoach}
                    </TableCellTw>
                    <TableCellTw testId="sprachkenntnis-td-bewertungDatum">
                      {entry.bewertungDatum
                        ? dayjs(entry.bewertungDatum).format('DD.MM.YYYY')
                        : ''}
                    </TableCellTw>
                    <TableCellTw className="text-right">
                      <ButtonTw
                        className="bg-red-600 ring-red-700 hover:bg-red-500"
                        testId="sprachkenntnis-delete-button"
                        disabled={isReadOnly || isLoading}
                        onClick={() => {
                          setSelectedSprachkenntnis(entry)
                          setShowDeleteModal(true)
                        }}
                      >
                        <TrashIcon className="size-5" />
                      </ButtonTw>
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
          </div>
        </>
      )}
      {!isReadOnly && (
        <>
          <div className="col-span-3">
            <InputSelectTw
              label={t('label.sprache')}
              testId="sprachkenntnis-sprache"
              control={control}
              options={SPRACHKENNTNISSE_OPTIONS}
              disabled
              {...register('sprache')}
            />
          </div>
          <div className="col-span-3">
            <InputSelectTw
              label={t('label.niveau')}
              placeholder={t('placeholder.niveau')}
              testId="sprachkenntnis-niveau"
              control={control}
              options={convertArrayToKeyLabelOptions(
                masterdata?.seminarPruefungNiveauList
              )}
              {...register('niveau')}
            />
          </div>
          <div className="col-span-3">
            <InputSelectTw
              label={t('label.bewertungCoach')}
              placeholder={t('placeholder.bewertungCoach')}
              testId="sprachkenntnis-bewertungCoach"
              control={control}
              options={convertArrayToKeyLabelOptions(
                masterdata?.seminarPruefungNiveauList
              )}
              {...register('bewertungCoach')}
            />
          </div>
          <div className="col-span-3">
            <DatepickerTw
              label={t('label.pruefungAm')}
              placeholder={t('placeholder.pruefungAm')}
              testId="sprachkenntnis-bewertungDatum"
              control={control}
              {...register('bewertungDatum')}
              {...getOverride('bewertungDatum')}
            />
          </div>
          <div className="col-span-12">
            <ButtonTw
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              size={ButtonSize.Large}
              isLoading={isLoading}
              testId="sprachkenntnis-add-button"
              onClick={onSubmit}
            >
              <PlusIcon className="size-5" />
              <span className="hidden lg:inline">{t('label.hinzufuegen')}</span>
            </ButtonTw>
          </div>
          <DefaultModal
            showModal={showDeleteModal}
            closeModal={() => {
              setShowDeleteModal(false)
            }}
          >
            <div className="space-y-6">
              <div className="mb-6 flex content-center items-center justify-between">
                <h3 className="text-2xl leading-7 font-semibold text-gray-900">
                  {t('label.deleteSprachkenntnis')}
                </h3>
              </div>
              <div>
                <p>{t('label.deleteSprachkenntnisDescription')}</p>
              </div>
              <HorizontalRow />

              <div className="col-span-12 flex justify-between">
                <ButtonTw
                  className="h-full"
                  size={ButtonSize.Large}
                  secondary
                  testId="sprachkenntnis-delete-cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('label.cancel')}
                </ButtonTw>
                <ButtonTw
                  className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
                  size={ButtonSize.Large}
                  onClick={() => {
                    setShowDeleteModal(false)
                    if (selectedSprachkenntnis) {
                      onDeleteSprachkenntnis(selectedSprachkenntnis)
                      setSelectedSprachkenntnis(null)
                    }
                  }}
                  testId="sprachkenntnis-delete-confirm-button"
                >
                  {t('label.deleteSprachkenntnisSubmit')}
                </ButtonTw>
              </div>
            </div>
          </DefaultModal>
        </>
      )}
      <HorizontalRow className="col-span-12 border-gray-900/10 xl:hidden" />
    </div>
  )
}

export default SprachkenntnisseTable
