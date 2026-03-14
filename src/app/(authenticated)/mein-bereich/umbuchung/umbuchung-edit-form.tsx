import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl'
import React from 'react'
import {
  Resolver,
  SubmitHandler,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
} from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw from '@/components/atoms/button-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { ConfirmModal } from '@/components/organisms/confirm-modal'

export interface UeberstundenMetadata {
  date: string
  reason: string
  isEligible: boolean
}

export interface UeberstundenKontoValue {
  zspNummer: number
  value: number
}

export interface UeberstundenKontoEntry extends UeberstundenKontoValue {
  zspName: string | number
  zurAuszahlung?: string | number
  abrechnung?: number
  unit: string | null
  zspComment?: string
}

interface FormData {
  kontoList: UeberstundenKontoEntry[]
}

const calculatePayoutDifference = (
  payout?: number | string,
  balance?: number | string
) => {
  if (!payout || !balance) {
    return 0
  }

  const balanceFloat =
    typeof balance === 'string' ? parseFloat(balance) : balance
  const payoutFloat = typeof payout === 'string' ? parseFloat(payout) : payout

  return balanceFloat - payoutFloat < 0
    ? 0
    : (balanceFloat - payoutFloat).toFixed(2)
}

export const convertMinutesToHours = (minutes?: number) =>
  minutes ? parseFloat((minutes / 60).toFixed(2)) : 0

const UmbuchungEditForm = ({
  kontoList,
  submitHandler,
  isDisabled,
}: {
  kontoList?: UeberstundenKontoEntry[]
  submitHandler: SubmitHandler<{
    kontoList: UeberstundenKontoEntry[]
  }>
  isDisabled: boolean
}) => {
  const t = useTranslations('umbuchung.overview')

  const createValidationSchema = () => {
    return yup.object().shape({
      kontoList: yup.array().of(
        yup.object().shape({
          zurAuszahlung: yup
            .mixed<string | number>()
            .nullable()
            .transform((value, originalValue) => {
              // Handle empty string and null/undefined
              if (
                originalValue === '' ||
                originalValue === null ||
                originalValue === undefined
              ) {
                return null
              }
              return value
            })
            .test('min-max-validation', function (value) {
              if (value === null || value === undefined) return true
              const parsedValue =
                typeof value === 'string' ? parseFloat(value) : value

              const { path } = this
              const index = parseInt(path.split('[')[1].split(']')[0])
              const maxValue = kontoList
                ? convertMinutesToHours(kontoList[index]?.value)
                : 0

              if (parsedValue < 0) {
                return this.createError({
                  message: 'Der Wert muss mindestens 0 sein',
                  path,
                })
              }

              if (parsedValue > maxValue) {
                return this.createError({
                  message: `Der Wert darf maximal ${maxValue} betragen`,
                  path,
                })
              }

              return true
            }),
        })
      ),
    })
  }

  const { handleSubmit, control, watch, formState } = useForm<FormData>({
    defaultValues: {
      kontoList,
    },
    // TODO: cleanup force cast
    resolver: yupResolver(
      createValidationSchema()
    ) as unknown as Resolver<FormData>,
    mode: 'onChange',
  })

  const { fields }: UseFieldArrayReturn<FormData, 'kontoList', 'id'> =
    useFieldArray({
      control,
      name: 'kontoList',
    })

  const formValues = watch()

  const hasValues = formValues.kontoList.some(
    (konto) =>
      !!konto.zurAuszahlung && parseFloat(`${konto?.zurAuszahlung}`) > 0
  )

  if (!isDisabled && !kontoList?.length) {
    return <InfoSectionTw description={t('keineUeberstundenInfoText')} />
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitHandler)}>
        <TableTw className="flex-auto" testId="umbuchung-table">
          <thead className="bg-gray-50">
            <tr>
              <TableHeaderTw>{t('table.stundenkonto')}</TableHeaderTw>
              <TableHeaderTw>{t('table.saldo')}</TableHeaderTw>
              <TableHeaderTw>{t('table.zurAuszahlung')}</TableHeaderTw>
              <TableHeaderTw>{t('table.zumZeitausgleich')}</TableHeaderTw>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map((field, index) => (
              <tr key={field.id}>
                <TableCellTw>
                  <div className="font-semibold text-gray-900">
                    {field.zspName}
                  </div>
                  {field.zspComment && (
                    <div className="mt-1 text-gray-400">{field.zspComment}</div>
                  )}
                </TableCellTw>
                <TableCellTw>{convertMinutesToHours(field.value)}</TableCellTw>
                <TableCellTw>
                  <InputTextTw
                    type="number"
                    control={control}
                    name={`kontoList.${index}.zurAuszahlung`}
                    placeholder="Zur Auszahlung"
                    decimals={2}
                    max={convertMinutesToHours(field.value)}
                    min={0}
                    pattern="^\d*\.?\d{0,2}$"
                    disabled={isDisabled}
                  />
                </TableCellTw>
                <TableCellTw>
                  {calculatePayoutDifference(
                    formValues['kontoList'][index]['zurAuszahlung'],
                    convertMinutesToHours(field.value)
                  )}
                </TableCellTw>
              </tr>
            ))}
          </tbody>
        </TableTw>
        <div className="mt-6 flex items-center justify-center gap-x-6">
          <ButtonTw
            type="submit"
            size="xlarge"
            disabled={isDisabled || !hasValues || !formState.isValid}
          >
            {t('save')}
          </ButtonTw>
        </div>
      </form>
      <ConfirmModal condition={hasValues} />
    </>
  )
}

export default UmbuchungEditForm
