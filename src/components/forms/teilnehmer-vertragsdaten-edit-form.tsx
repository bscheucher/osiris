'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import HorizontalRow from '../atoms/hr-tw'
import { ConfirmModal } from '../organisms/confirm-modal'
import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import { useCustomIsDirty } from '@/hooks/use-custom-is-dirty'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import {
  convertToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'
import useOnboardingStore from '@/stores/onboarding-store'

interface Props {
  personalnummer: string
  submitHandler: (data: VertragsdatenEntry) => void
  vertragsDaten: VertragsdatenEntry
  isReadOnly?: boolean
}

export default function TeilnehmerVertragsdatenEditForm({
  submitHandler,
  vertragsDaten,
  isReadOnly = false,
}: Props) {
  const { kostenstellen } = useOnboardingStore()
  const { masterdataTN: masterdata } = useMasterdataStore()

  const t = useTranslations('mitarbeiter.erfassen.vertragsdaten')
  const tModal = useTranslations('mitarbeiter.erfassen')

  const {
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    watch,
    reset,
    control,
  } = useForm<VertragsdatenEntry>({
    defaultValues: vertragsDaten,
  })
  const isDirty = useCustomIsDirty(vertragsDaten, watch)

  const [getOverride, setOverride] = useFormEffectOverrides()

  useFormEffect<VertragsdatenEntry>(
    {
      isBefristet: (value) => {
        setOverride('befristungBis', {
          required: !!value,
          disabled: !value || isReadOnly,
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
    reset(vertragsDaten)
    // Set new errors from backend
    if (vertragsDaten.errorsMap) {
      setErrorsFromErrorsMap(vertragsDaten.errorsMap, setError)
    }
  }, [clearErrors, reset, setError, vertragsDaten])

  const formHandler = (props: VertragsdatenEntry) => {
    submitHandler(props)
    reset(props)
  }

  return (
    <>
      <form onSubmit={handleSubmit(formHandler)}>
        <div className="space-y-10">
          <div className="mb-6 flex content-center items-center justify-between">
            <h3 className="text-2xl leading-7 font-semibold text-gray-900">
              {t('section.allgemein')}
            </h3>
            <ButtonTw type="submit" size="xlarge">
              {t('button.speichern')}
            </ButtonTw>
          </div>
          {/* Allgemein Section */}
          <div>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-6 2xl:col-span-4">
                <DatepickerTw
                  label={t('label.eintritt')}
                  placeholder={t('placeholder.eintritt')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="eintritt"
                />
              </div>
              <div className="col-span-6 2xl:col-span-4">
                <InputToggleTw
                  control={control}
                  label={t('label.isBefristet')}
                  leftLabel={t('checkbox.prefix')}
                  rightLabel={t('checkbox.suffix')}
                  required
                  disabled={isReadOnly}
                  name="isBefristet"
                />
              </div>
              <div className="col-span-6 2xl:col-span-4">
                <DatepickerTw
                  label={t('label.befristungBis')}
                  placeholder={t('placeholder.befristungBis')}
                  control={control}
                  disabled
                  name="befristungBis"
                  {...getOverride('befristungBis')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.kostenstelle')}
                  options={convertToKeyLabelOptions(kostenstellen)}
                  placeholder={t('placeholder.kostenstelle')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="kostenstelle"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <ComboSelectTw
                  label={t('label.dienstort')}
                  options={convertToKeyLabelOptions(masterdata?.dienstortList)}
                  placeholder={t('placeholder.dienstort')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="dienstort"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <ComboSelectTw
                  label={t('label.fuehrungskraft')}
                  options={convertToKeyLabelOptions(
                    masterdata?.fuehrungskraftList
                  )}
                  placeholder={t('placeholder.fuehrungskraft')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="fuehrungskraft"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.kategorie')}
                  options={convertToKeyLabelOptions(masterdata?.kategorieList)}
                  placeholder={t('placeholder.kategorie')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="kategorie"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <ComboSelectTw
                  label={t('label.taetigkeit')}
                  options={convertToKeyLabelOptions(masterdata?.taetigkeitList)}
                  placeholder={t('placeholder.taetigkeit')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="taetigkeit"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.kollektivvertrag')}
                  options={convertToKeyLabelOptions(
                    masterdata?.kollektivvertragList
                  )}
                  placeholder={t('placeholder.kollektivvertrag')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="kollektivvertrag"
                />
              </div>
              <div className="col-span-12 2xl:col-span-6">
                <InputTextTw
                  label={t('label.notizAllgemein')}
                  placeholder={t('placeholder.notizAllgemein')}
                  control={control}
                  disabled={isReadOnly}
                  name="notizAllgemein"
                />
              </div>
            </div>
          </div>
          <HorizontalRow />

          {/* Gehalt Section */}
          <div>
            <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
              {t('section.gehalt')}
            </h3>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
              <div className="col-span-6 2xl:col-span-4">
                <DatepickerTw
                  label={t('label.naechsteVorrueckung')}
                  placeholder={t('placeholder.naechsteVorrueckung')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="naechsteVorrueckung"
                />
              </div>
              <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.klasse')}
                  options={convertToKeyLabelOptions(masterdata?.klasseList)}
                  placeholder={t('placeholder.klasse')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="klasse"
                />
              </div>
              <div className="col-span-6 2xl:col-span-4">
                <InputTextTw
                  label={t('label.lehrjahr')}
                  placeholder={t('placeholder.lehrjahr')}
                  control={control}
                  type="number"
                  required
                  disabled={isReadOnly}
                  name="lehrjahr"
                />
              </div>
            </div>
          </div>

          {/* Arbeitszeit Section */}
          <div>
            <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
              {t('section.arbeitszeit')}
            </h3>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
              <div className="col-span-4 2xl:col-span-4">
                <InputTextTw
                  label={t('label.wochenstunden')}
                  placeholder={t('placeholder.wochenstunden')}
                  control={control}
                  required
                  type="number"
                  disabled={isReadOnly}
                  name="wochenstunden"
                />
              </div>
              <div className="col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.abrechnungsgruppe')}
                  options={convertToKeyLabelOptions(
                    masterdata?.abrechnungsgruppeList
                  )}
                  placeholder={t('placeholder.abrechnungsgruppe')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="abrechnungsgruppe"
                />
              </div>
              <div className="col-span-6 2xl:col-span-4">
                <InputSelectTw
                  label={t('label.dienstnehmergruppe')}
                  options={convertToKeyLabelOptions(
                    masterdata?.dienstnehmergruppeList
                  )}
                  placeholder={t('placeholder.dienstnehmergruppe')}
                  control={control}
                  required
                  disabled={isReadOnly}
                  name="dienstnehmergruppe"
                />
              </div>
              <div className="col-span-12 2xl:col-span-12">
                <InputTextTw
                  label={t('label.notizArbeitszeit')}
                  placeholder={t('placeholder.notizArbeitszeit')}
                  control={control}
                  disabled={isReadOnly}
                  name="notizArbeitszeit"
                />
              </div>
            </div>
          </div>
          <HorizontalRow className="border-gray-900/10 pb-4" />
        </div>
      </form>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <ButtonTw
          type="submit"
          size="xlarge"
          testId={'save-button'}
          onClick={handleSubmit(formHandler)}
        >
          {t('button.speichern')}
        </ButtonTw>
      </div>
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
