'use client'

import { useTranslations } from 'next-intl'
import { Control, UseFormRegister } from 'react-hook-form'

import { TeilnehmerFormValues } from './teilnehmer-edit-form'
import InputFileOnboardingTw from '@/components/atoms/input-file-onboarding-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import { Teilnehmer } from '@/lib/interfaces/teilnehmer'

interface Props {
  control: Control<TeilnehmerFormValues, any, TeilnehmerFormValues>
  register: UseFormRegister<TeilnehmerFormValues>
  participant: Teilnehmer
  isReadOnly: boolean
}

export default function TeilnehmerStammdatenSection({
  control,
  register,
  participant,
  isReadOnly,
}: Props) {
  const t = useTranslations('mitarbeiter.erfassen.stammdaten')

  return (
    <>
      <h3 className="mb-7 text-2xl leading-7 font-semibold text-gray-900">
        {t('section.bankdaten')}
      </h3>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <input type="hidden" {...register('stammdaten.id')} />

        <div className="col-span-6">
          <InputTextTw
            label={t('label.bank')}
            placeholder={t('placeholder.bank')}
            control={control}
            disabled={isReadOnly}
            name="stammdaten.bank"
          />
        </div>
        <div className="col-span-6">
          <InputTextTw
            label={t('label.iban')}
            placeholder={t('placeholder.iban')}
            control={control}
            disabled={isReadOnly}
            name="stammdaten.iban"
          />
        </div>
        <div className="col-span-6">
          <InputTextTw
            label={t('label.bic')}
            placeholder={t('placeholder.bic')}
            control={control}
            disabled={isReadOnly}
            name="stammdaten.bic"
          />
        </div>
        {participant.personalnummer && (
          <div className="col-span-6">
            <InputFileOnboardingTw
              personalnummer={participant.personalnummer}
              label={t('label.bankcard')}
              placeholder={t('placeholder.bankcard')}
              control={control}
              disabled={isReadOnly}
              name="stammdaten.bankcard"
            />
          </div>
        )}
      </div>
    </>
  )
}
