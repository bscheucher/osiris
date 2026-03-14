'use client'

import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'

import ArbeitszeitTable from './arbeitszeit-table'
import UnterhaltsberechtigteForm from './unterhaltsberechtigte-form'
import VordienstzeitenForm from './vordienstzeiten-form'
import HorizontalRow from '../atoms/hr-tw'
import { ConfirmModal } from '../organisms/confirm-modal'
import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { useCustomIsDirty } from '@/hooks/use-custom-is-dirty'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import {
  convertToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import useMasterdataStore from '@/stores/form-store'
import useOnboardingStore from '@/stores/onboarding-store'

export type FormValues = VertragsdatenEntry & {
  montagBisFreitagNetto: string
  montagBisFreitagVon: string
  montagBisFreitagBis: string
  montagBisFreitagKernzeitVon: string
  montagBisFreitagKernzeitBis: string
  // TODO: add other fields once all inputs are migrated to improved type safety
}

interface Props {
  personalnummer: string
  onValidSubmit?: (data: VertragsdatenEntry) => void
  vertragsDaten: VertragsdatenEntry
  isReadOnly?: boolean
  hideSubmitButtons?: boolean
  isOnboarding?: boolean
}

const MitarbeiterVertragsdatenEditForm = forwardRef<
  {
    submitForm: () => Promise<void>
    getFormValues: () => FormValues
  },
  Props
>(
  (
    {
      personalnummer,
      onValidSubmit = () => {},
      vertragsDaten,
      hideSubmitButtons,
      isReadOnly = false,
      isOnboarding,
    },
    ref
  ) => {
    const { kostenstellen } = useOnboardingStore()
    const { masterdataMA: masterdata } = useMasterdataStore()
    const t = useTranslations('mitarbeiter.erfassen.vertragsdaten')
    const tModal = useTranslations('mitarbeiter.erfassen')
    const [getOverride, setOverride] = useFormEffectOverrides()
    const {
      register,
      handleSubmit,
      clearErrors,
      getValues,
      setError,
      setValue,
      watch,
      reset,
      control,
    } = useForm<FormValues>({
      defaultValues: vertragsDaten,
    })
    const isDirty = useCustomIsDirty(vertragsDaten, watch)
    const kategorieValue = watch('kategorie')
    const filteredArbeitszeitmodellList =
      masterdata?.arbeitszeitmodellList.filter(
        (entry) =>
          // only show 'Gleitzeit - TZ', 'Gleitzeit - VZ' for 'Führungskraft', 'Schlüsselkraft'
          !(
            [
              'Gleitzeit - TZ',
              'Gleitzeit - VZ',
              'Gleitzeit ÜP',
              'All In Teilzeit',
              'All In Vollzeit AIVZ',
            ].includes(entry) &&
            !['Führungskraft', 'Schlüsselkraft'].includes(kategorieValue)
          ) &&
          // only show 'Durchrechnung.*' for 'Training'
          !(entry.includes('Durchrechnung') && kategorieValue !== 'Training')
      )

    useFormEffect<FormValues>(
      {
        isBefristet: (value) => {
          setOverride('befristungBis', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
        },
        eintritt: (value) => {
          if (value) {
            const today = dayjs().startOf('day')
            const inputDate = dayjs(value).startOf('day')
            const minDate = inputDate.isAfter(today)
              ? inputDate.add(1, 'day').toDate()
              : today.toDate()

            setValue('arbeitszeitmodellVon', value)
            setOverride('befristungBis', {
              minDate: dayjs(value).add(1, 'week').toDate(),
            })
            setOverride('arbeitszeitmodellBis', {
              minDate,
            })
          }
        },
        verwendungsgruppe: (value) => {
          // allow selection if VB 5-8
          if (['VB 5', 'VB 6', 'VB 7', 'VB 8'].includes(value as string)) {
            setOverride('vereinbarungUEberstunden', {
              required: true,
              disabled: isReadOnly,
            })
          } else {
            setOverride('vereinbarungUEberstunden', {
              required: false,
              disabled: true,
            })
            setValue('vereinbarungUEberstunden', 'Keine')
          }
        },
        arbeitszeitmodell: (value) => {
          const isDurchrechner =
            typeof value === 'string' && value.startsWith('Durchrechnung')
          setOverride('auswahlBegruendungFuerDurchrechner', {
            required: !!isDurchrechner,
            disabled: !isDurchrechner || isReadOnly,
          })
          if (!isDurchrechner) {
            setValue('auswahlBegruendungFuerDurchrechner', '')
          }
          setOverride('arbeitszeitmodellBis', {
            required: !!isDurchrechner,
            disabled: !isDurchrechner || isReadOnly,
          })
          const isGleitzeit =
            typeof value === 'string' && value.startsWith('Gleitzeit')
          setOverride('kernzeit', {
            required: !!isGleitzeit,
            disabled: !isGleitzeit || isReadOnly,
          })
          if (!isGleitzeit) {
            setValue('kernzeit', false)
          }
        },
        fixZulage: (value) => {
          setOverride('zulageInEuroFix', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
        },
        funktionsZulage: (value) => {
          setOverride('zulageInEuroFunktion', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
        },
        leitungsZulage: (value) => {
          setOverride('zulageInEuroLeitung', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
        },
        jobticket: (value) => {
          setOverride('jobticketTitle', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
        },
        weitereAdressezuHauptwohnsitz: (value) => {
          setOverride('strasse', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
          setOverride('plz', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
          setOverride('ort', {
            required: !!value,
            disabled: !value || isReadOnly,
          })
          setOverride('land', {
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

      // set all form fields to latest version of vertragsDaten
      reset(vertragsDaten)

      // Set new errors from backend
      if (vertragsDaten.errorsMap) {
        setErrorsFromErrorsMap(vertragsDaten.errorsMap, setError)
      }
    }, [clearErrors, reset, setError, vertragsDaten])

    // Expose the submitForm method to the parent via ref
    useImperativeHandle(ref, () => ({
      submitForm: () => handleSubmit(onValidSubmit)(),
      getFormValues: () => getValues(),
    }))

    return (
      <>
        <form onSubmit={handleSubmit(onValidSubmit)}>
          <div className="space-y-10">
            <div className="mb-6 flex content-center items-center justify-between">
              <h3 className="text-2xl leading-7 font-semibold text-gray-900">
                {t('section.allgemein')}
              </h3>
              {!hideSubmitButtons && (
                <ButtonTw
                  type="submit"
                  size="xlarge"
                  testId="save-button"
                  disabled={isReadOnly}
                >
                  {t('button.speichern')}
                </ButtonTw>
              )}
            </div>
            {/* Allgemein Section */}
            <div>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                <div className="3xl:col-span-3 col-span-6 2xl:col-span-4">
                  <DatepickerTw
                    label={t('label.eintritt')}
                    placeholder={t('placeholder.eintritt')}
                    control={control}
                    required
                    name="eintritt"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="3xl:col-span-2 col-span-6 2xl:col-span-4">
                  <InputToggleTw
                    control={control}
                    label={t('label.isBefristet')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="isBefristet"
                  />
                </div>
                <div className="3xl:col-span-3 col-span-6 2xl:col-span-4">
                  <DatepickerTw
                    label={t('label.befristungBis')}
                    placeholder={t('placeholder.befristungBis')}
                    control={control}
                    disabled
                    name="befristungBis"
                    {...getOverride('befristungBis')}
                  />
                </div>
                <div className="3xl:col-span-4 col-span-12 xl:col-span-6 2xl:col-span-4">
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
                    options={convertToKeyLabelOptions(
                      masterdata?.dienstortList
                    )}
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
                  <ComboSelectTw
                    label={t('label.startcoach')}
                    options={convertToKeyLabelOptions(
                      masterdata?.startcoachList
                    )}
                    placeholder={t('placeholder.startcoach')}
                    control={control}
                    disabled={isReadOnly}
                    name="startcoach"
                  />
                </div>
                <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                  <InputSelectTw
                    label={t('label.kategorie')}
                    options={convertToKeyLabelOptions(
                      masterdata?.kategorieList
                    )}
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
                    options={convertToKeyLabelOptions(
                      masterdata?.taetigkeitList
                    )}
                    placeholder={t('placeholder.taetigkeit')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="taetigkeit"
                  />
                </div>
                <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                  <ComboSelectTw
                    label={t('label.jobBezeichnung')}
                    options={convertToKeyLabelOptions(
                      masterdata?.jobbeschreibungList
                    )}
                    placeholder={t('placeholder.jobBezeichnung')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="jobBezeichnung"
                  />
                </div>
                <div className="3xl:col-span-3 col-span-12 xl:col-span-6 2xl:col-span-4">
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
                <div className="3xl:col-span-3 col-span-12 xl:col-span-6 2xl:col-span-4">
                  <InputSelectTw
                    label={t('label.verwendungsgruppe')}
                    options={convertToKeyLabelOptions(
                      masterdata?.verwendungsgruppeList
                    )}
                    placeholder={t('placeholder.verwendungsgruppe')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="verwendungsgruppe"
                  />
                </div>
                <div className="3xl:col-span-12 col-span-12">
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

            {/* Arbeitszeit Section */}
            <div>
              <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
                {t('section.arbeitszeit')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.beschaeftigungsausmass')}
                    options={convertToKeyLabelOptions(
                      masterdata?.beschaeftigungsausmassList
                    )}
                    placeholder={t('placeholder.beschaeftigungsausmass')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="beschaeftigungsausmass"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.beschaeftigungsstatus')}
                    options={convertToKeyLabelOptions(
                      masterdata?.beschaeftigungsstatusList
                    )}
                    placeholder={t('placeholder.beschaeftigungsstatus')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="beschaeftigungsstatus"
                  />
                </div>

                <div className="col-span-8 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.arbeitszeitmodell')}
                    options={convertToKeyLabelOptions(
                      filteredArbeitszeitmodellList
                    )}
                    placeholder={t('placeholder.arbeitszeitmodell')}
                    control={control}
                    required
                    disabled={isReadOnly}
                    name="arbeitszeitmodell"
                  />
                </div>
                <div className="col-span-8 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.auswahlBegruendungFuerDurchrechner')}
                    options={convertToKeyLabelOptions(
                      masterdata?.auswahlBegruendungFuerDurchrechnerList
                    )}
                    placeholder={t(
                      'placeholder.auswahlBegruendungFuerDurchrechner'
                    )}
                    control={control}
                    disabled
                    name="auswahlBegruendungFuerDurchrechner"
                    {...getOverride('auswahlBegruendungFuerDurchrechner')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <DatepickerTw
                    label={t('label.arbeitszeitmodellVon')}
                    placeholder={t('placeholder.arbeitszeitmodellVon')}
                    control={control}
                    disabled
                    name="arbeitszeitmodellVon"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <DatepickerTw
                    label={t('label.arbeitszeitmodellBis')}
                    placeholder={t('placeholder.arbeitszeitmodellBis')}
                    control={control}
                    disabled
                    name="arbeitszeitmodellBis"
                    {...getOverride('arbeitszeitmodellBis')}
                  />
                </div>

                <div className="col-span-6 2xl:col-span-3">
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
                <div className="col-span-6 2xl:col-span-3">
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
                <div className="col-span-4 2xl:col-span-3">
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
                <div className="col-span-6 2xl:col-span-3">
                  <InputToggleTw
                    control={control}
                    required
                    label={t('label.urlaubVorabVereinbart')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="urlaubVorabVereinbart"
                  />
                </div>
                <div className="col-span-12 2xl:col-span-3">
                  <InputToggleTw
                    control={control}
                    required
                    disabled
                    label={t('label.kernzeit')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    name="kernzeit"
                    {...getOverride('kernzeit')}
                  />
                </div>
              </div>
              {/* Arbeitszeiten Section */}
              <h4 className="mb-8 text-xl leading-5 font-semibold text-gray-900">
                {t('section.arbeitszeiten')}
              </h4>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                <div className="col-span-12 2xl:col-span-12">
                  <InfoSectionTw
                    description={t('arbeitszeitTable.labels.schnellEingabe')}
                  />
                </div>
                <div className="col-span-12 mt-2 mb-8">
                  <ArbeitszeitTable
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    hasKernzeit={watch('kernzeit')}
                    isReadOnly={isReadOnly}
                  />
                </div>
                <div className="col-span-12 2xl:col-span-6">
                  <InputTextTw
                    label={t('label.spezielleMittagspausenregelung')}
                    placeholder={t(
                      'placeholder.spezielleMittagspausenregelung'
                    )}
                    control={control}
                    disabled={isReadOnly}
                    name="spezielleMittagspausenregelung"
                  />
                </div>
                <div className="col-span-12 2xl:col-span-6">
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
            <HorizontalRow />

            {/* Gehalt Section */}
            <div>
              <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
                {t('section.gehalt')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.stufe')}
                    placeholder={t('placeholder.stufe')}
                    control={control}
                    disabled
                    name="stufe"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputToggleTw
                    control={control}
                    label={t('label.facheinschlaegigeTaetigkeitenGeprueft')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="facheinschlaegigeTaetigkeitenGeprueft"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t(
                      'label.angerechneteFacheinschlaegigeTaetigkeitenMonate'
                    )}
                    placeholder={t(
                      'placeholder.angerechneteFacheinschlaegigeTaetigkeitenMonate'
                    )}
                    control={control}
                    disabled
                    name="angerechneteFacheinschlaegigeTaetigkeitenMonate"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.angerechneteIbisMonate')}
                    placeholder={t('placeholder.angerechneteIbisMonate')}
                    control={control}
                    type="number"
                    disabled={isReadOnly}
                    name="angerechneteIbisMonate"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.kvGehaltBerechnet')}
                    placeholder={t('placeholder.kvGehaltBerechnet')}
                    control={control}
                    disabled
                    name="kvGehaltBerechnet"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.gehaltVereinbart')}
                    placeholder={t('placeholder.gehaltVereinbart')}
                    control={control}
                    type="number"
                    disabled={isReadOnly}
                    name="gehaltVereinbart"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.ueberzahlung')}
                    placeholder={t('placeholder.ueberzahlung')}
                    control={control}
                    disabled={isReadOnly}
                    name="ueberzahlung"
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Arbeitszeiten Section */}
              <h4 className="mb-8 text-xl leading-5 font-semibold text-gray-900">
                {t('section.artDerZulage')}
              </h4>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6 pb-8">
                <div className="col-span-6 2xl:col-span-2">
                  <InputToggleTw
                    control={control}
                    label={t('label.fixZulage')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="fixZulage"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-4">
                  <InputTextTw
                    label={t('label.zulageInEuroFix')}
                    placeholder={t('placeholder.zulageInEuroFix')}
                    control={control}
                    type="number"
                    disabled
                    name="zulageInEuroFix"
                    {...getOverride('zulageInEuroFix')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-2">
                  <InputToggleTw
                    control={control}
                    label={t('label.funktionsZulage')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="funktionsZulage"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-4">
                  <InputTextTw
                    label={t('label.zulageInEuroFunktion')}
                    placeholder={t('placeholder.zulageInEuroFunktion')}
                    control={control}
                    type="number"
                    disabled
                    name="zulageInEuroFunktion"
                    {...getOverride('zulageInEuroFunktion')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-2">
                  <InputToggleTw
                    control={control}
                    label={t('label.leitungsZulage')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="leitungsZulage"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-4">
                  <InputTextTw
                    label={t('label.zulageInEuroLeitung')}
                    placeholder={t('placeholder.zulageInEuroLeitung')}
                    control={control}
                    type="number"
                    disabled
                    name="zulageInEuroLeitung"
                    {...getOverride('zulageInEuroLeitung')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-6">
                  <InputSelectTw
                    label={t('label.vereinbarungUEberstunden')}
                    options={convertToKeyLabelOptions(
                      masterdata?.abgeltungUeberstundenList
                    )}
                    placeholder={t('placeholder.vereinbarungUEberstunden')}
                    control={control}
                    disabled
                    name="vereinbarungUEberstunden"
                    {...getOverride('vereinbarungUEberstunden')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-2">
                  <InputToggleTw
                    control={control}
                    label={t('label.jobticket')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="jobticket"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-4">
                  <InputSelectTw
                    label={t('label.jobticketTitle')}
                    options={convertToKeyLabelOptions(
                      masterdata?.jobticketList
                    )}
                    placeholder={t('placeholder.jobticketTitle')}
                    control={control}
                    disabled={isReadOnly}
                    name="jobticketTitle"
                    {...getOverride('jobticketTitle')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-6">
                  <InputTextTw
                    label={t('label.notizGehalt')}
                    placeholder={t('placeholder.notizGehalt')}
                    control={control}
                    disabled={isReadOnly}
                    name="notizGehalt"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-6">
                  <InputTextTw
                    label={t('label.gesamtBrutto')}
                    placeholder={t('placeholder.gesamtBrutto')}
                    control={control}
                    disabled
                    name="gesamtBrutto"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-6">
                  <InputTextTw
                    label={t('label.deckungspruefung')}
                    placeholder={t('placeholder.deckungspruefung')}
                    control={control}
                    disabled
                    name="deckungspruefung"
                  />
                </div>
              </div>
            </div>
            <HorizontalRow />

            <div>
              <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
                {t('section.zusatzvereinbarung')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                <div className="col-span-6 2xl:col-span-3">
                  <InputToggleTw
                    control={control}
                    required
                    label={t('label.mobileWorking')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="mobileWorking"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputToggleTw
                    control={control}
                    required
                    label={t('label.weitereAdressezuHauptwohnsitz')}
                    leftLabel={t('checkbox.prefix')}
                    rightLabel={t('checkbox.suffix')}
                    disabled={isReadOnly}
                    name="weitereAdressezuHauptwohnsitz"
                  />
                </div>
                <div className="col-span-12 2xl:col-span-6">
                  <InputTextTw
                    label={t('label.notizZusatzvereinbarung')}
                    placeholder={t('placeholder.notizZusatzvereinbarung')}
                    control={control}
                    disabled={isReadOnly}
                    name="notizZusatzvereinbarung"
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.strasse')}
                    placeholder={t('placeholder.strasse')}
                    control={control}
                    disabled
                    name="strasse"
                    {...getOverride('strasse')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.plz')}
                    placeholder={t('placeholder.plz')}
                    control={control}
                    disabled
                    type="number"
                    name="plz"
                    {...getOverride('plz')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.ort')}
                    placeholder={t('placeholder.ort')}
                    control={control}
                    disabled
                    name="ort"
                    {...getOverride('ort')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.land')}
                    options={convertToKeyLabelOptions(masterdata?.landList)}
                    placeholder={t('placeholder.land')}
                    control={control}
                    disabled
                    name="land"
                    {...getOverride('land')}
                  />
                </div>
              </div>
            </div>
            <HorizontalRow className="border-gray-900/10 pb-4" />
          </div>
        </form>

        <div className="mt-8">
          <VordienstzeitenForm
            personalnummer={personalnummer}
            isReadOnly={isReadOnly}
            isOnboarding={isOnboarding}
          />
        </div>
        <HorizontalRow className="border-gray-900/10 pb-4" />
        <div className="mt-8">
          <UnterhaltsberechtigteForm
            personalnummer={personalnummer}
            isReadOnly={isReadOnly}
            isOnboarding={isOnboarding}
          />
        </div>
        {!hideSubmitButtons && (
          <>
            <HorizontalRow className="border-gray-900/10 pb-4" />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <ButtonTw
                type="submit"
                size="xlarge"
                testId="save-button"
                onClick={handleSubmit(onValidSubmit)}
                disabled={isReadOnly}
              >
                {t('button.speichern')}
              </ButtonTw>
            </div>
          </>
        )}
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
)

MitarbeiterVertragsdatenEditForm.displayName =
  'MitarbeiterVertragsdatenEditForm'

export default MitarbeiterVertragsdatenEditForm
