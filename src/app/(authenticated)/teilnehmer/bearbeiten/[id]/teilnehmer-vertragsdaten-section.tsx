'use client'

import { useTranslations } from 'next-intl'
import { Control, UseFormRegister } from 'react-hook-form'

import { TeilnehmerFormValues } from './teilnehmer-edit-form'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'

interface Props {
  control: Control<TeilnehmerFormValues, any, TeilnehmerFormValues>
  register: UseFormRegister<TeilnehmerFormValues>
}

export default function TeilnehmerVertragsdatenSection({
  control,
  register,
}: Props) {
  const t = useTranslations('teilnehmer.bearbeiten')
  const tVertragsdaten = useTranslations('mitarbeiter.erfassen.vertragsdaten')

  return (
    <>
      <h3 className="text-xl leading-7 font-semibold text-gray-900">
        {t('section.vertragsdaten')}
      </h3>
      {/* Allgemein Section */}
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <input type="hidden" {...register('vertragsdaten.id')} />
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.eintritt')}
            placeholder={tVertragsdaten('placeholder.eintritt')}
            control={control}
            disabled
            name="vertragsdaten.eintritt"
          />
        </div>
        <div className="col-span-6 2xl:col-span-4">
          <InputToggleTw
            control={control}
            label={tVertragsdaten('label.isBefristet')}
            leftLabel={tVertragsdaten('checkbox.prefix')}
            rightLabel={tVertragsdaten('checkbox.suffix')}
            disabled
            name="vertragsdaten.isBefristet"
          />
        </div>
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.befristungBis')}
            placeholder={tVertragsdaten('placeholder.befristungBis')}
            control={control}
            disabled
            name="vertragsdaten.befristungBis"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.kostenstelle')}
            placeholder={tVertragsdaten('placeholder.kostenstelle')}
            control={control}
            disabled
            name="vertragsdaten.kostenstelle"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.dienstort')}
            placeholder={tVertragsdaten('placeholder.dienstort')}
            control={control}
            disabled
            name="vertragsdaten.dienstort"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.fuehrungskraft')}
            placeholder={tVertragsdaten('placeholder.fuehrungskraft')}
            control={control}
            disabled
            name="vertragsdaten.fuehrungskraft"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.kategorie')}
            placeholder={tVertragsdaten('placeholder.kategorie')}
            control={control}
            disabled
            name="vertragsdaten.kategorie"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.taetigkeit')}
            placeholder={tVertragsdaten('placeholder.taetigkeit')}
            control={control}
            disabled
            name="vertragsdaten.taetigkeit"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.kollektivvertrag')}
            placeholder={tVertragsdaten('placeholder.kollektivvertrag')}
            control={control}
            disabled
            name="vertragsdaten.kollektivvertrag"
          />
        </div>
        <div className="col-span-12 2xl:col-span-12">
          <InputTextTw
            label={tVertragsdaten('label.notizAllgemein')}
            placeholder={tVertragsdaten('placeholder.notizAllgemein')}
            control={control}
            disabled
            name="vertragsdaten.notizAllgemein"
          />
        </div>
      </div>

      {/* Gehalt Section */}
      <h3 className="text-lg leading-6 font-semibold text-gray-900">
        {t('section.gehalt')}
      </h3>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.naechsteVorrueckung')}
            placeholder={tVertragsdaten('placeholder.naechsteVorrueckung')}
            control={control}
            disabled
            name="vertragsdaten.naechsteVorrueckung"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.klasse')}
            placeholder={tVertragsdaten('placeholder.klasse')}
            control={control}
            disabled
            name="vertragsdaten.klasse"
          />
        </div>
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.lehrjahr')}
            placeholder={tVertragsdaten('placeholder.lehrjahr')}
            control={control}
            type="number"
            disabled
            name="vertragsdaten.lehrjahr"
          />
        </div>
      </div>
      {/* Arbeitszeit Section */}
      <h3 className="text-lg leading-6 font-semibold text-gray-900">
        {t('section.arbeitszeit')}
      </h3>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.wochenstunden')}
            placeholder={tVertragsdaten('placeholder.wochenstunden')}
            control={control}
            disabled
            name="vertragsdaten.wochenstunden"
          />
        </div>
        <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.abrechnungsgruppe')}
            placeholder={tVertragsdaten('placeholder.abrechnungsgruppe')}
            control={control}
            disabled
            name="vertragsdaten.abrechnungsgruppe"
          />
        </div>
        <div className="col-span-6 2xl:col-span-4">
          <InputTextTw
            label={tVertragsdaten('label.dienstnehmergruppe')}
            placeholder={tVertragsdaten('placeholder.dienstnehmergruppe')}
            control={control}
            type="number"
            disabled
            name="vertragsdaten.dienstnehmergruppe"
          />
        </div>
      </div>
    </>
  )
}
