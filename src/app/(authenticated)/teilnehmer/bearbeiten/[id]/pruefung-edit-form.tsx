import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { SeminarPruefung } from '@/lib/interfaces/teilnehmer'
import {
  convertArrayToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import { ErrorsResponse, executePOST } from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

interface ModalProps {
  seminarPruefungEntry: SeminarPruefung | null
  teilnehmerId?: number
  seminarId?: number

  closeForm: () => void
  setSeminarPruefungen: React.Dispatch<React.SetStateAction<SeminarPruefung[]>>
}

const SeminarPruefungEditForm = ({
  seminarPruefungEntry,
  teilnehmerId,
  seminarId,
  closeForm,
  setSeminarPruefungen,
}: ModalProps) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(false)
  const { masterdataTN: masterdata } = useMasterdataStore()

  const antrittValue =
    seminarPruefungEntry?.antritt === false
      ? 'false'
      : seminarPruefungEntry?.antritt === true
        ? 'true'
        : ''

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    control,
    setValue,
    watch,
  } = useForm<SeminarPruefung>({
    defaultValues: { ...seminarPruefungEntry, antritt: antrittValue },
  })

  const [getOverride, setOverride] = useFormEffectOverrides()

  useFormEffect<SeminarPruefung>(
    {
      gegenstand: (value) => {
        setOverride('niveau', { required: value === 'Deutsch' })
      },
      antritt: (value) => {
        const isActive = value === 'false'
        console.log('isActive', isActive)
        if (!isActive) {
          setValue('begruendung', '')
        }
        setOverride('begruendung', { disabled: !isActive, required: isActive })
      },
    },
    watch,
    setValue
  )

  const onSubmit: SubmitHandler<SeminarPruefung> = async (formValues) => {
    if (!teilnehmerId || !seminarId) {
      return
    }

    setIsLoading(true)
    clearErrors()

    const { data } = await executePOST<{
      seminarPruefung: Array<SeminarPruefung & ErrorsResponse>
    }>(`/teilnehmer/edit/${teilnehmerId}/seminar/${seminarId}/pruefung`, {
      ...formValues,
    })
    const latestPruefung = data?.seminarPruefung[0]

    if (latestPruefung) {
      clearErrors()

      reset(latestPruefung)

      if (latestPruefung.errors?.length && latestPruefung.errorsMap) {
        setErrorsFromErrorsMap(latestPruefung.errorsMap, setError)
      } else {
        // if no errors were found
        // add the new entry to the list
        setSeminarPruefungen((prevPruefungen: SeminarPruefung[]) => {
          // remove the old entry if it exists in case of update
          const updatedPruefungen = prevPruefungen.filter(
            (item) => item.id !== latestPruefung.id
          )
          return [...updatedPruefungen, latestPruefung]
        })
        // close the form
        closeForm()
      }
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="mb-6 flex content-center items-center justify-between">
          <h3
            className="text-xl leading-7 font-semibold text-gray-900"
            data-testid="unterhaltsberechtigt-form-headline"
          >
            {seminarPruefungEntry
              ? t('label.pruefungBearbeiten')
              : t('label.pruefungHinzufuegen')}
          </h3>
        </div>
        <div>
          <div className="grid grid-cols-12 gap-x-8 gap-y-6">
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.bezeichnung')}
                placeholder={t('placeholder.bezeichnung')}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungBezeichnungList
                )}
                control={control}
                required
                {...register('bezeichnung')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.pruefungArt')}
                placeholder={t('placeholder.pruefungArt')}
                control={control}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungArtList
                )}
                required
                {...register('pruefungArt')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.gegenstand')}
                placeholder={t('placeholder.gegenstand')}
                control={control}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungGegenstandList
                )}
                required
                {...register('gegenstand')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.niveau')}
                placeholder={t('placeholder.niveau')}
                control={control}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungNiveauList
                )}
                {...register('niveau')}
                {...getOverride('niveau')}
              />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.institut')}
                placeholder={t('placeholder.institut')}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungInstitutList
                )}
                control={control}
                {...register('institut')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <DatepickerTw
                label={t('label.pruefungAm')}
                placeholder={t('placeholder.pruefungAm')}
                control={control}
                {...register('pruefungAm')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.antritt')}
                placeholder={t('placeholder.antritt')}
                options={[
                  { key: 'true', label: t('label.antrittJa') },
                  {
                    key: 'false',
                    label: t('label.antrittNein'),
                  },
                ]}
                control={control}
                {...register('antritt')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.begruendung')}
                placeholder={t('placeholder.begruendung')}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungBegruendungList
                )}
                control={control}
                {...register('begruendung')}
                {...getOverride('begruendung')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputSelectTw
                label={t('label.ergebnis')}
                placeholder={t('placeholder.ergebnis')}
                control={control}
                options={convertArrayToKeyLabelOptions(
                  masterdata?.seminarPruefungErgebnisList
                )}
                {...register('ergebnis')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <InputTextTw
                label={t('label.ergebnisInProzent')}
                placeholder={t('placeholder.ergebnisInProzent')}
                control={control}
                type="number"
                {...register('ergebnisInProzent')}
              />
            </div>
          </div>
        </div>
        <HorizontalRow />
        <div className="col-span-12 flex justify-between">
          <ButtonTw
            type="button"
            className="h-full"
            size={ButtonSize.Large}
            isLoading={isLoading}
            onClick={() => closeForm()}
            testId="pruefung-cancel-button"
            secondary
          >
            {t('label.cancel')}
          </ButtonTw>
          <ButtonTw
            type="submit"
            className="h-full"
            size={ButtonSize.Large}
            isLoading={isLoading}
            testId="pruefung-save-button"
          >
            {t('label.save')}
          </ButtonTw>
        </div>
      </div>
    </form>
  )
}
export default SeminarPruefungEditForm
