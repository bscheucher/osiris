import { TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import {
  KOSTENSTELLEN_OPTIONS,
  Leistung,
  TAETIGKEITEN_OPTIONS,
} from './leistungserfassung-utils'
import BadgeTw, { BadgeColor, BadgeSize } from '@/components/atoms/badge-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import { TimePickerV2Tw } from '@/components/atoms/time-picker-v2-tw'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'
import { ErrorsResponse } from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

interface ModalProps {
  leistungEntry?: (Leistung & ErrorsResponse) | null
  closeForm: () => void
  setAppointments: React.Dispatch<React.SetStateAction<Leistung[]>>
}

export interface LeistungFormValues {
  von: string
  bis: string
  datum: string
  ort: string
  leistungsart?: string
  kostentraeger: string
  taetigkeit: string
  seminarbucheintrag?: string
  bemerkung?: string
  pauseVon?: string
  pauseBis?: string
}

const LeistungEditForm = ({
  leistungEntry,
  closeForm,
  setAppointments,
}: ModalProps) => {
  const t = useTranslations('leistungenErfassen')
  const [isLoading, setIsLoading] = useState(false)
  const { masterdataTN: masterdata } = useMasterdataStore()

  const { register, handleSubmit, control } = useForm<LeistungFormValues>({
    defaultValues: {
      ...leistungEntry,
      datum: leistungEntry?.datum || dayjs().format('YYYY-MM-DD'),
      von: leistungEntry?.von || dayjs().startOf('hour').format('HH:mm'),
      bis:
        leistungEntry?.bis ||
        dayjs().startOf('hour').add(4, 'hours').format('HH:mm'),
      taetigkeit: leistungEntry?.taetigkeit,
      kostentraeger: leistungEntry?.kostentraeger,
      ort: 'Office',
      bemerkung: leistungEntry?.bemerkung,
      seminarbucheintrag: '',
    },
  })

  const taetigkeitValue = useWatch({ control, name: 'taetigkeit' })
  const showSeminarbucheintrag =
    taetigkeitValue === 'Seminar' || taetigkeitValue === 'Seminar-Vertretung'

  const createLeistung = (formValues: LeistungFormValues) => {
    const newAppointment: Leistung = {
      ...formValues,
      id: Math.random().toString(36).substring(2, 11),
      status: 'confirmed',
    }
    setAppointments((prevAppointments) => [...prevAppointments, newAppointment])
  }

  const updateLeistung = (formValues: LeistungFormValues) => {
    if (!leistungEntry?.id) return

    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) => {
        if (appointment.id === leistungEntry.id) {
          return {
            ...formValues,
            status: 'confirmed',
          } as Leistung
        }
        return appointment
      })
    )
  }

  const deleteLeistung = () => {
    if (!leistungEntry?.id) return
    setAppointments((prevAppointments) => [
      ...prevAppointments.filter((entry) => entry.id !== leistungEntry?.id),
    ])
  }

  const onSubmit: SubmitHandler<LeistungFormValues> = async (formValues) => {
    // TODO: implement submit endpoint
    if (leistungEntry?.id) {
      updateLeistung(formValues)
    } else {
      createLeistung(formValues)
    }

    setIsLoading(false)
    closeForm()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="mb-6 flex content-center items-center justify-between">
          <h3
            className="flex items-center gap-3 text-xl leading-7 font-semibold text-gray-900"
            data-testid="leistung-form-headline"
          >
            {leistungEntry
              ? t('label.leistungBearbeiten')
              : t('label.leistungErfassen')}
            {leistungEntry?.status === 'draft' && (
              <BadgeTw color={BadgeColor.Blue} size={BadgeSize.Large}>
                Vorschlag
              </BadgeTw>
            )}
          </h3>
        </div>
        <div>
          <div className="grid grid-cols-12 gap-x-8 gap-y-6">
            <div className="col-span-12 lg:col-span-12">
              <DatepickerTw
                label={t('label.datum')}
                placeholder={t('placeholder.datum')}
                control={control}
                required
                {...register('datum')}
              />
            </div>
            <div className="col-span-6 lg:col-span-3">
              <TimePickerV2Tw
                label={t('label.von')}
                control={control}
                name={'von'}
                required
              />
            </div>
            <div className="col-span-6 lg:col-span-3">
              <TimePickerV2Tw
                label={t('label.bis')}
                control={control}
                name={'bis'}
                required
              />
            </div>
            <div className="col-span-6 lg:col-span-3">
              <TimePickerV2Tw
                label={t('label.pauseVon')}
                control={control}
                name={'pauseVon'}
              />
            </div>
            <div className="col-span-6 lg:col-span-3">
              <TimePickerV2Tw
                label={t('label.pauseBis')}
                control={control}
                name={'pauseBis'}
              />
            </div>
            <div className="col-span-6">
              <ComboSelectTw
                label={t('label.taetigkeit')}
                placeholder={t('placeholder.taetigkeit')}
                control={control}
                options={convertArrayToKeyLabelOptions(TAETIGKEITEN_OPTIONS)}
                required
                {...register('taetigkeit')}
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <ComboSelectTw
                label={t('label.kostentraeger')}
                placeholder={t('placeholder.kostentraeger')}
                control={control}
                options={convertArrayToKeyLabelOptions(KOSTENSTELLEN_OPTIONS)}
                required
                {...register('kostentraeger')}
              />
            </div>

            <div className="col-span-12">
              <InputSelectTw
                label={t('label.ort')}
                placeholder={t('placeholder.ort')}
                control={control}
                options={convertArrayToKeyLabelOptions([
                  'Office',
                  'Home Office',
                  'Mobile working',
                ])}
                required
                {...register('ort')}
              />
            </div>
            {showSeminarbucheintrag && (
              <div className="col-span-12">
                <TextareaTw
                  label={t('label.seminarbucheintrag')}
                  placeholder={t('placeholder.seminarbucheintrag')}
                  control={control}
                  rows={3}
                  required
                  {...register('seminarbucheintrag')}
                />
              </div>
            )}
            <div className="col-span-12">
              <TextareaTw
                label={t('label.bemerkung')}
                placeholder={t('placeholder.bemerkung')}
                control={control}
                rows={3}
                {...register('bemerkung')}
              />
            </div>
          </div>
        </div>
        <HorizontalRow />
        <div className="col-span-12 flex justify-between">
          {leistungEntry ? (
            <ButtonTw
              type="button"
              size={ButtonSize.Large}
              className="flex gap-2 bg-red-600 ring-red-700 hover:bg-red-500"
              testId="leistung-delete-button"
              onClick={() => {
                closeForm()
                deleteLeistung()
              }}
            >
              <TrashIcon className="size-5" />
              {t('label.loeschen')}
            </ButtonTw>
          ) : (
            <ButtonTw
              type="button"
              size={ButtonSize.Large}
              isLoading={isLoading}
              onClick={() => closeForm()}
              testId="leistung-cancel-button"
              secondary
            >
              {t('label.abbrechen')}
            </ButtonTw>
          )}
          <ButtonTw
            type="submit"
            size={ButtonSize.Large}
            isLoading={isLoading}
            testId="leistung-save-button"
          >
            {t('label.speichern')}
          </ButtonTw>
        </div>
      </div>
    </form>
  )
}

export default LeistungEditForm
