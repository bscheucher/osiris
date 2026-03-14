import { useTranslations } from 'next-intl'
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import { FormValues } from './mitarbeiter-vertragsdaten-edit-form'
import InputTextTw from '@/components/atoms/input-text-tw'
import { TimePickerV2Tw } from '@/components/atoms/time-picker-v2-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { useFormEffect } from '@/hooks/use-form-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'

interface Props {
  register: UseFormRegister<FormValues>
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
  watch: UseFormWatch<FormValues>
  hasKernzeit?: boolean
  isReadOnly?: boolean
}

const WEEK_DAYS = [
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag',
  'sonntag',
]

const WORKDAYS = WEEK_DAYS.slice(0, 5) // Monday to Friday

const ArbeitszeitTable = ({
  control,
  setValue,
  watch,
  hasKernzeit = true,
  isReadOnly = false,
}: Props) => {
  const t = useTranslations(
    'mitarbeiter.erfassen.vertragsdaten.arbeitszeitTable'
  )

  useFormEffect(
    {
      montagBisFreitagVon: (value) => {
        if (value) {
          WORKDAYS.forEach((weekday) => {
            setValue(`a${weekday}Von` as keyof VertragsdatenEntry, value)
          })
        }
      },
      montagBisFreitagBis: (value) => {
        if (value) {
          WORKDAYS.forEach((weekday) => {
            setValue(`a${weekday}Bis` as keyof VertragsdatenEntry, value)
          })
        }
      },
      montagBisFreitagKernzeitVon: (value) => {
        if (value) {
          WORKDAYS.forEach((weekday) => {
            setValue(`k${weekday}Von` as keyof VertragsdatenEntry, value)
          })
        }
      },
      montagBisFreitagKernzeitBis: (value) => {
        if (value) {
          WORKDAYS.forEach((weekday) => {
            setValue(`k${weekday}Bis` as keyof VertragsdatenEntry, value)
          })
        }
      },
      montagBisFreitagNetto: (value) => {
        if (value) {
          WORKDAYS.forEach((weekday) => {
            setValue(`a${weekday}Netto` as keyof VertragsdatenEntry, value)
          })
        }
      },
    },
    watch,
    setValue
  )

  return (
    <TableTw className="flex-auto">
      <thead className="bg-gray-50">
        <tr>
          <TableHeaderTw>{` `}</TableHeaderTw>
          <TableHeaderTw>{t(`header.avon`)}</TableHeaderTw>
          <TableHeaderTw>{t(`header.abis`)}</TableHeaderTw>
          {hasKernzeit && (
            <>
              <TableHeaderTw>{t(`header.kvon`)}</TableHeaderTw>
              <TableHeaderTw>{t(`header.kbis`)}</TableHeaderTw>
            </>
          )}
          <TableHeaderTw>{t(`header.anetto`)}</TableHeaderTw>
        </tr>
      </thead>
      <tbody>
        <tr
          key={'montagBisFreitag'}
          className={twMerge(isReadOnly && 'hidden')}
        >
          <TableCellTw className="px-3 whitespace-nowrap">
            {t(`labels.montagBisFreitag`)}
          </TableCellTw>
          <TableCellTw className="px-3 align-top">
            <TimePickerV2Tw
              control={control}
              name="montagBisFreitagVon"
              placeholder={t(`placeholder.montagBisFreitagVon`)}
            />
          </TableCellTw>
          <TableCellTw className="px-3 align-top">
            <TimePickerV2Tw
              control={control}
              name="montagBisFreitagBis"
              placeholder={t(`placeholder.montagBisFreitagBis`)}
            />
          </TableCellTw>
          {hasKernzeit && (
            <>
              <TableCellTw className="px-3 align-top">
                <TimePickerV2Tw
                  control={control}
                  name="montagBisFreitagKernzeitVon"
                  placeholder={t(`placeholder.montagBisFreitagKernzeitVon`)}
                />
              </TableCellTw>
              <TableCellTw className="px-3 align-top">
                <TimePickerV2Tw
                  control={control}
                  name="montagBisFreitagKernzeitBis"
                  placeholder={t(`placeholder.montagBisFreitagKernzeitBis`)}
                />
              </TableCellTw>
            </>
          )}
          <TableCellTw className="px-3 align-top">
            <InputTextTw
              control={control}
              name="montagBisFreitagNetto"
              placeholder={t(`placeholder.montagBisFreitagNetto`)}
              type="number"
            />
          </TableCellTw>
        </tr>
        {WEEK_DAYS.map((weekday: string) => (
          <tr key={weekday}>
            <TableCellTw className="px-3">{t(`labels.${weekday}`)}</TableCellTw>
            <TableCellTw className="px-3 align-top">
              <TimePickerV2Tw
                control={control}
                name={`a${weekday}Von` as keyof VertragsdatenEntry}
                placeholder={t(`placeholder.a${weekday}Von`)}
              />
            </TableCellTw>
            <TableCellTw className="px-3 align-top">
              <TimePickerV2Tw
                control={control}
                disabled={isReadOnly}
                name={`a${weekday}Bis` as keyof VertragsdatenEntry}
                placeholder={t(`placeholder.a${weekday}Bis`)}
              />
            </TableCellTw>
            {hasKernzeit && (
              <>
                <TableCellTw className="px-3 align-top">
                  <TimePickerV2Tw
                    control={control}
                    disabled={isReadOnly}
                    name={`k${weekday}Von` as keyof VertragsdatenEntry}
                    placeholder={t(`placeholder.k${weekday}Von`)}
                  />
                </TableCellTw>
                <TableCellTw className="px-3 align-top">
                  <TimePickerV2Tw
                    control={control}
                    disabled={isReadOnly}
                    name={`k${weekday}Bis` as keyof VertragsdatenEntry}
                    placeholder={t(`placeholder.k${weekday}Bis`)}
                  />
                </TableCellTw>
              </>
            )}
            <TableCellTw className="px-3 align-top">
              <InputTextTw
                control={control}
                type="number"
                disabled={isReadOnly}
                name={`a${weekday}Netto` as keyof VertragsdatenEntry}
                placeholder={t(`placeholder.a${weekday}Netto`)}
              />
            </TableCellTw>
          </tr>
        ))}
      </tbody>
    </TableTw>
  )
}

export default ArbeitszeitTable
