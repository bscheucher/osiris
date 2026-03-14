'use client'

import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import HorizontalRow from '../atoms/hr-tw'
import { ConfirmModal } from '../organisms/confirm-modal'
import PlzOrtModal from '../organisms/plz-ort-modal'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputFileOnboardingTw from '@/components/atoms/input-file-onboarding-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { useCustomIsDirty } from '@/hooks/use-custom-is-dirty'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { StammdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { getAgeAsString } from '@/lib/utils/date-utils'
import {
  convertToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'

interface Props {
  personalnummer: string
  submitHandler: (data: StammdatenEntry) => void
  stammDaten: StammdatenEntry
  isReadOnly?: boolean
}

export default function TeilnehmerStammdatenEditForm({
  personalnummer,
  submitHandler,
  stammDaten,
  isReadOnly = false,
}: Props) {
  const { masterdataTN: masterdata } = useMasterdataStore()

  const t = useTranslations('mitarbeiter.erfassen.stammdaten')
  const tModal = useTranslations('mitarbeiter.erfassen')
  const [showOrtPlzModal, setShowOrtPlzModal] = useState(false)

  const {
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<StammdatenEntry>({
    defaultValues: stammDaten,
  })
  const isDirty = useCustomIsDirty(stammDaten, watch)

  const euCountriesFromMasterdata = useMemo<string[]>(() => {
    if (masterdata?.completeLandList) {
      return masterdata.completeLandList
        .filter((country) => country.euEeaCh)
        .map((country) => country.landName)
    }
    return []
  }, [masterdata])

  const [getOverride, setOverride] = useFormEffectOverrides()

  const plzValue = watch('plz')
  const ortValue = watch('ort')
  const showResolveButton =
    (!!errors.ort || !!errors.plz) && plzValue && ortValue

  useFormEffect<StammdatenEntry>(
    {
      geburtsDatum: (value) => {
        // age calculation logic
        const calculatedAge = getAgeAsString(value)
        setValue('alter', calculatedAge)
      },
      staatsbuergerschaft: (value) => {
        // citizenship logic
        setOverride('arbeitsgenehmigung', {
          required: !euCountriesFromMasterdata.includes(value),
        })

        setOverride('arbeitsgenehmigungDok', {
          required: !euCountriesFromMasterdata.includes(value),
        })
      },
    },
    watch,
    setValue
  )

  useEffect(() => {
    // Clear any existing errors first
    clearErrors()

    // set all form fields to latest version of stammDaten
    reset(stammDaten)

    // Set new errors from backend
    if (stammDaten.errorsMap) {
      setErrorsFromErrorsMap(stammDaten.errorsMap, setError)
    }
  }, [clearErrors, reset, setError, stammDaten])

  const formHandler = (props: any) => {
    submitHandler(props)
    reset(props)
  }

  return (
    <>
      <form onSubmit={handleSubmit(formHandler)}>
        <div className="space-y-12">
          <div className="mb-4 flex content-center items-center justify-between">
            <h3 className="text-2xl leading-7 font-semibold text-gray-900">
              {t('section.personendaten')}
            </h3>
            <ButtonTw type="submit" size="xlarge">
              {t('button.speichern')}
            </ButtonTw>
          </div>
          {/* Personal Data Section */}
          <div>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-12 xl:col-span-4 2xl:col-span-6">
                <InputTextTw
                  label={t('label.personalnummer')}
                  control={control}
                  disabled
                  name="personalnummer"
                />
              </div>
              <div className="col-span-12 xl:col-span-8 2xl:col-span-6">
                <InputTextTw
                  label={t('label.firma')}
                  control={control}
                  disabled
                  name="firma"
                />
              </div>
              <div className="col-span-6 xl:col-span-4 2xl:col-span-3">
                <InputSelectTw
                  label={t('label.anrede')}
                  options={convertToKeyLabelOptions(masterdata?.anredeList)}
                  placeholder={t('placeholder.anrede')}
                  control={control}
                  disabled={isReadOnly}
                  name="anrede"
                />
              </div>
              <div className="col-span-6 xl:col-span-4 2xl:col-span-3">
                <InputSelectTw
                  label={t('label.titel')}
                  options={convertToKeyLabelOptions(masterdata?.titelList)}
                  placeholder={t('placeholder.titel')}
                  control={control}
                  disabled={isReadOnly}
                  name="titel"
                />
              </div>
              <div className="col-span-6 xl:col-span-4 2xl:col-span-3">
                <InputSelectTw
                  label={t('label.titel2')}
                  options={convertToKeyLabelOptions(masterdata?.titelList)}
                  placeholder={t('placeholder.titel2')}
                  control={control}
                  disabled={isReadOnly}
                  name="titel2"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputSelectTw
                  label={t('label.geschlecht')}
                  options={convertToKeyLabelOptions(masterdata?.geschlechtList)}
                  placeholder={t('placeholder.geschlecht')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="geschlecht"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.vorname')}
                  placeholder={t('placeholder.vorname')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="vorname"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.nachname')}
                  placeholder={t('placeholder.nachname')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="nachname"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.geburtsname')}
                  placeholder={t('placeholder.geburtsname')}
                  control={control}
                  disabled={isReadOnly}
                  name="geburtsname"
                />
              </div>

              <div className="col-span-6 2xl:col-span-3">
                <InputSelectTw
                  label={t('label.familienstand')}
                  options={convertToKeyLabelOptions(
                    masterdata?.familienstandList
                  )}
                  placeholder={t('placeholder.familienstand')}
                  control={control}
                  disabled={isReadOnly}
                  name="familienstand"
                />
              </div>
              <div className="3xl:col-span-6 col-span-12 xl:col-span-6 2xl:col-span-6">
                <ComboSelectTw
                  label={t('label.staatsbuergerschaft')}
                  options={convertToKeyLabelOptions(
                    masterdata?.staatsbuergerschaftList
                  )}
                  placeholder={t('placeholder.staatsbuergerschaft')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="staatsbuergerschaft"
                />
              </div>
              <div className="3xl:col-span-3 col-span-6 2xl:col-span-3">
                <ComboSelectTw
                  label={t('label.muttersprache')}
                  options={convertToKeyLabelOptions(
                    masterdata?.mutterspracheList
                  )}
                  placeholder={t('placeholder.muttersprache')}
                  control={control}
                  disabled={isReadOnly}
                  name="muttersprache"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.svnr')}
                  placeholder={t('placeholder.svnr')}
                  maxLength={10}
                  type="number"
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="svnr"
                />
              </div>
              <div className="3xl:col-span-4 col-span-6 2xl:col-span-4">
                <DatepickerTw
                  label={t('label.geburtsDatum')}
                  placeholder={t('placeholder.geburtsDatum')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="geburtsDatum"
                />
              </div>
              <div className="3xl:col-span-2 col-span-6 2xl:col-span-2">
                <InputTextTw
                  label={t('label.alter')}
                  maxLength={3}
                  control={control}
                  disabled
                  name="alter"
                  {...getOverride('alter')}
                />
              </div>
              <div className="col-span-12 xl:col-span-12 2xl:col-span-6">
                <InputFileOnboardingTw
                  personalnummer={personalnummer}
                  label={t('label.ecard')}
                  placeholder={t('placeholder.ecard')}
                  control={control}
                  disabled={isReadOnly}
                  name="ecard"
                />
              </div>
            </div>
          </div>
          <HorizontalRow />

          {/* Contact Data Section */}
          <div>
            <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
              {t('section.kontaktdaten')}
            </h3>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
              <div className="col-span-6 2xl:col-span-4">
                <InputTextTw
                  label={t('label.strasse')}
                  placeholder={t('placeholder.strasse')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="strasse"
                />
              </div>
              <div className="col-span-6 2xl:col-span-2">
                <InputTextTw
                  label={t('label.plz')}
                  placeholder={t('placeholder.plz')}
                  control={control}
                  required
                  type="number"
                  disabled={isReadOnly}
                  name="plz"
                />
              </div>
              <div className="col-span-12 flex items-start gap-4 2xl:col-span-6">
                <div className="flex-1">
                  <InputTextTw
                    label={t('label.ort')}
                    placeholder={t('placeholder.ort')}
                    control={control}
                    required
                    disabled={isReadOnly}
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
              <div className="col-span-6 2xl:col-span-3">
                <ComboSelectTw
                  label={t('label.land')}
                  options={convertToKeyLabelOptions(masterdata?.landList)}
                  placeholder={t('placeholder.land')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="land"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.email')}
                  placeholder={t('placeholder.email')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="email"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.mobilnummer')}
                  placeholder={t('placeholder.mobilnummer')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="mobilnummer"
                />
              </div>
            </div>

            {/* Alternative Address Section */}
            <h4 className="mb-5 text-xl leading-5 font-semibold text-gray-900">
              {t('section.abweichendePostadresse')}
            </h4>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.strasse')}
                  placeholder={t('placeholder.strasse')}
                  control={control}
                  disabled={isReadOnly}
                  name="astrasse"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.plz')}
                  placeholder={t('placeholder.plz')}
                  control={control}
                  type="number"
                  disabled={isReadOnly}
                  name="aplz"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <InputTextTw
                  label={t('label.ort')}
                  placeholder={t('placeholder.ort')}
                  control={control}
                  disabled={isReadOnly}
                  name="aort"
                />
              </div>
              <div className="col-span-6 2xl:col-span-3">
                <ComboSelectTw
                  label={t('label.land')}
                  options={convertToKeyLabelOptions(masterdata?.landList)}
                  placeholder={t('placeholder.land')}
                  name="aland"
                  disabled={isReadOnly}
                  control={control}
                />
              </div>
            </div>
          </div>

          <HorizontalRow />

          {/* Bank Data Section */}
          <div>
            <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
              {t('section.bankdaten')}
            </h3>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-6">
                <InputTextTw
                  label={t('label.bank')}
                  placeholder={t('placeholder.bank')}
                  control={control}
                  disabled={isReadOnly}
                  name="bank"
                />
              </div>
              <div className="col-span-6">
                <InputTextTw
                  label={t('label.iban')}
                  placeholder={t('placeholder.iban')}
                  control={control}
                  disabled={isReadOnly}
                  name="iban"
                />
              </div>
              <div className="col-span-6">
                <InputTextTw
                  label={t('label.bic')}
                  placeholder={t('placeholder.bic')}
                  control={control}
                  disabled={isReadOnly}
                  name="bic"
                />
              </div>
              <div className="col-span-6">
                <InputFileOnboardingTw
                  personalnummer={personalnummer}
                  label={t('label.bankcard')}
                  placeholder={t('placeholder.bankcard')}
                  control={control}
                  disabled={isReadOnly}
                  name="bankcard"
                />
              </div>
            </div>
          </div>
          <HorizontalRow />
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <ButtonTw type="submit" size="xlarge" testId="save-button">
            {t('button.speichern')}
          </ButtonTw>
        </div>
      </form>
      <PlzOrtModal
        showModal={showOrtPlzModal}
        closeModal={() => {
          setShowOrtPlzModal(false)
        }}
        plzOrtData={{ plz: plzValue, ort: ortValue }}
      />
      <ConfirmModal
        condition={isDirty}
        title={tModal('confirmModal.title')}
        text={tModal('confirmModal.text')}
        confirmLabel={tModal('confirmModal.ja')}
        cancelLabel={tModal('confirmModal.nein')}
      />
    </>
  )
}
