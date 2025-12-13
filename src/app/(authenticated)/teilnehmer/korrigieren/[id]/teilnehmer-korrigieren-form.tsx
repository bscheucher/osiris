import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { UserMinusIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw/index'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { ConfirmModal } from '@/components/organisms/confirm-modal'
import PlzOrtModal from '@/components/organisms/plz-ort-modal'
import { useCustomIsDirty } from '@/hooks/use-custom-is-dirty'
import { SeminarEntry, Teilnehmer } from '@/lib/interfaces/teilnehmer'
import {
  convertToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import { executePOST, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'

export type TeilnehmerFormValues = Omit<Teilnehmer, 'id'>

const IGNORED_ERROR_KEYS = ['seminar']

const TeilnehmerKorrigierenForm = ({
  participant,
  teilnehmerId,
  setParticipant,
  setSeminarData,
}: {
  participant: Teilnehmer
  teilnehmerId?: number | null
  setParticipant?: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
  setSeminarData?: React.Dispatch<React.SetStateAction<SeminarEntry[]>>
}) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(false)
  const [showOrtPlzModal, setShowOrtPlzModal] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm<TeilnehmerFormValues>({
    defaultValues: participant,
  })

  const formValues = useWatch({ control })
  const showResolveButton =
    (!!errors.ort || !!errors.plz) && formValues.plz && formValues.ort

  const { masterdataTN: masterdata } = useMasterdataStore()
  const isDirty = useCustomIsDirty(participant, watch)

  useEffect(() => {
    if (participant) {
      clearErrors()

      reset(participant)

      if (participant?.errorsMap) {
        setErrorsFromErrorsMap(
          participant?.errorsMap,
          setError,
          IGNORED_ERROR_KEYS
        )
      }
    }
  }, [clearErrors, participant, reset, setError])

  const onSubmit: SubmitHandler<TeilnehmerFormValues> = async (
    teilnehmerFormData
  ) => {
    setIsLoading(true)

    try {
      const { data } = await executePOST<{ teilnehmerSeminars: any[] }>(
        `/teilnehmer/edit/${teilnehmerId}?isKorrigieren=true`,
        {
          teilnehmerDto: teilnehmerFormData,
        }
      )

      if (data?.teilnehmerSeminars[0]) {
        const { seminarDtos, teilnehmerDto } = data.teilnehmerSeminars[0]

        if (setParticipant && teilnehmerDto) {
          setParticipant(teilnehmerDto)
        }

        if (setSeminarData && seminarDtos) {
          setSeminarData(seminarDtos)
        }

        showSuccess(t('success.gespeichert'))
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  // This can be passed to other components
  const submitForm = handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <>
      <div className="space-y-8">
        <form>
          <div className="mb-8 space-y-10">
            <div className="border-b border-gray-900/10 pb-12">
              <div className="mb-6 flex items-center justify-between gap-x-6">
                <h3 className="text-xl leading-7 font-semibold text-gray-900">
                  {t('section.persoenlicheDaten')}
                </h3>
                <ButtonTw
                  type="submit"
                  disabled={isLoading}
                  size="xlarge"
                  isLoading={isLoading}
                  onClick={submitForm}
                  testId="tn-save"
                >
                  {t('button.speichern')}
                </ButtonTw>
              </div>

              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.anrede')}
                    options={convertToKeyLabelOptions(masterdata?.anredeList)}
                    placeholder={t('placeholder.anrede')}
                    control={control}
                    {...register('anrede')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.titel')}
                    options={convertToKeyLabelOptions(masterdata?.titelList)}
                    placeholder={t('placeholder.titel')}
                    control={control}
                    {...register('titel')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.titel2')}
                    options={convertToKeyLabelOptions(masterdata?.titelList)}
                    placeholder={t('placeholder.titel2')}
                    control={control}
                    {...register('titel2')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.vorname')}
                    placeholder={t('placeholder.vorname')}
                    control={control}
                    required
                    {...register('vorname')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.nachname')}
                    placeholder={t('placeholder.nachname')}
                    control={control}
                    required
                    {...register('nachname')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    type="number"
                    label={t('label.svnr')}
                    placeholder={t('placeholder.svnr')}
                    maxLength={10}
                    control={control}
                    required
                    {...register('svNummer')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.geschlecht')}
                    options={convertToKeyLabelOptions(
                      masterdata?.geschlechtList
                    )}
                    placeholder={t('placeholder.geschlecht')}
                    control={control}
                    required
                    {...register('geschlecht')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <DatepickerTw
                    label={t('label.geburtsdatum')}
                    placeholder={t('placeholder.geburtsdatum')}
                    control={control}
                    required
                    {...register('geburtsdatum')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.staatsbuergerschaft')}
                    options={convertToKeyLabelOptions(
                      masterdata?.staatsbuergerschaftList
                    )}
                    placeholder={t('placeholder.staatsbuergerschaft')}
                    control={control}
                    required
                    {...register('nation')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.ursprungsland')}
                    options={convertToKeyLabelOptions(
                      masterdata?.staatsbuergerschaftList
                    )}
                    placeholder={t('placeholder.ursprungsland')}
                    control={control}
                    {...register('ursprungsland')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.geburtsort')}
                    placeholder={t('placeholder.geburtsort')}
                    control={control}
                    {...register('geburtsort')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.muttersprache')}
                    options={convertToKeyLabelOptions(
                      masterdata?.mutterspracheList
                    )}
                    placeholder={t('placeholder.muttersprache')}
                    control={control}
                    name="muttersprache"
                  />
                </div>
              </div>
            </div>
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="mb-5 text-xl leading-7 font-semibold text-gray-900">
                {t('section.kontaktdaten')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-12 xl:col-span-12">
                  <InputTextTw
                    label={t('label.strasse')}
                    placeholder={t('placeholder.strasse')}
                    control={control}
                    required
                    {...register('strasse')}
                  />
                </div>
                <div className="col-span-4 xl:col-span-3">
                  <InputTextTw
                    type="number"
                    label={t('label.plz')}
                    placeholder={t('placeholder.plz')}
                    control={control}
                    required
                    {...register('plz')}
                  />
                </div>

                <div className="col-span-8 flex items-start gap-4 xl:col-span-9">
                  <div className="flex-1">
                    <InputTextTw
                      label={t('label.ort')}
                      placeholder={t('placeholder.ort')}
                      control={control}
                      required
                      name="ort"
                    />
                  </div>
                  {showResolveButton && (
                    <ButtonTw
                      onClick={() => {
                        setShowOrtPlzModal(true)
                      }}
                      className="bg-ibis-emerald mt-8 flex gap-2 text-white ring-emerald-600 hover:bg-emerald-500"
                      size={ButtonSize.Large}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      {t('label.plzOrtButton')}
                    </ButtonTw>
                  )}
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.land')}
                    control={control}
                    value="Österreich"
                    disabled
                    {...register('land')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.telefonPrivat')}
                    placeholder={t('placeholder.telefonPrivat')}
                    control={control}
                    required
                    {...register('telefon')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.email')}
                    placeholder={t('placeholder.email')}
                    control={control}
                    {...register('email')}
                  />
                </div>
              </div>
            </div>
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="mb-5 text-xl leading-7 font-semibold text-gray-900">
                {t('section.seminardaten')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.seminarBezeichnung')}
                    placeholder={t('placeholder.seminarBezeichnung')}
                    control={control}
                    {...register('seminarBezeichnung')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.buchungsstatus')}
                    placeholder={t('placeholder.buchungsstatus')}
                    control={control}
                    {...register('buchungsstatus')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.massnahmennummer')}
                    placeholder={t('placeholder.massnahmennummer')}
                    control={control}
                    {...register('massnahmennummer')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.veranstaltungsnummer')}
                    placeholder={t('placeholder.veranstaltungsnummer')}
                    control={control}
                    {...register('veranstaltungsnummer')}
                  />
                </div>
                <div className="col-span-12">
                  <InputTextTw
                    label={t('label.anmerkung')}
                    placeholder={t('placeholder.anmerkung')}
                    control={control}
                    {...register('anmerkung')}
                  />
                </div>
                <div className="col-span-6">
                  <DatepickerTw
                    label={t('label.zubuchung')}
                    placeholder={t('placeholder.zubuchung')}
                    control={control}
                    {...register('zubuchung')}
                  />
                </div>
                <div className="col-span-6">
                  <DatepickerTw
                    label={t('label.geplant')}
                    placeholder={t('placeholder.geplant')}
                    control={control}
                    {...register('geplant')}
                  />
                </div>
                <div className="col-span-6">
                  <DatepickerTw
                    label={t('label.eintritt')}
                    placeholder={t('placeholder.eintritt')}
                    control={control}
                    {...register('eintritt')}
                  />
                </div>
                <div className="col-span-6">
                  <DatepickerTw
                    label={t('label.austritt')}
                    placeholder={t('placeholder.austritt')}
                    control={control}
                    {...register('austritt')}
                  />
                </div>
              </div>
            </div>
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="mb-5 text-xl leading-7 font-semibold text-gray-900">
                {t('section.amsDaten')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.rgs')}
                    placeholder={t('placeholder.rgs')}
                    control={control}
                    {...register('rgs')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.betreuerTitel')}
                    placeholder={t('placeholder.betreuerTitel')}
                    control={control}
                    {...register('betreuerTitel')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.betreuerVorname')}
                    placeholder={t('placeholder.betreuerVorname')}
                    control={control}
                    {...register('betreuerVorname')}
                  />
                </div>
                <div className="col-span-6">
                  <InputTextTw
                    label={t('label.betreuerNachname')}
                    placeholder={t('placeholder.betreuerNachname')}
                    control={control}
                    {...register('betreuerNachname')}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-6 flex flex-row-reverse items-center justify-between gap-x-6">
          <ButtonTw
            type="submit"
            disabled={isLoading}
            size="xlarge"
            isLoading={isLoading}
            onClick={submitForm}
            testId="tn-save"
          >
            {t('button.speichern')}
          </ButtonTw>
          {participant && participant.personalnummer && (
            <ButtonTw
              href={`/teilnehmer/austritte/anlegen${toQueryString({ teilnehmerId: participant.id, vorname: participant.vorname, nachname: participant.nachname, svNummer: participant.svNummer })}`}
              disabled={isLoading}
              size="xlarge"
              isLoading={isLoading}
              className="gap-3"
              secondary
              testId="tn-abmelden"
            >
              <UserMinusIcon className="size-5" />
              {t('button.abmelden')}
            </ButtonTw>
          )}
        </div>
      </div>
      <PlzOrtModal
        showModal={showOrtPlzModal}
        closeModal={() => {
          setShowOrtPlzModal(false)
        }}
        plzOrtData={{ plz: formValues.plz, ort: formValues.ort }}
      />
      <ConfirmModal
        condition={isDirty}
        title={t('verlassen.modal.title')}
        text={t('verlassen.modal.text')}
        confirmLabel={t('verlassen.modal.confirm')}
        cancelLabel={t('verlassen.modal.cancel')}
      />
    </>
  )
}

export default TeilnehmerKorrigierenForm
