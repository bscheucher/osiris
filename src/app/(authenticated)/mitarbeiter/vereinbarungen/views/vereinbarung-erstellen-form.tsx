'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { VereinbarungEntry } from '../vereinbarungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import MitarbeiterSearchTw from '@/components/molecules/mitarbeiter-search-tw'
import { ReportDescription } from '@/components/organisms/dynamic-form-fields'
import useAsyncEffect from '@/hooks/use-async-effect'
import { MitarbeiterResult } from '@/lib/interfaces/mitarbeiter'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'
import { executeGET } from '@/lib/utils/gateway-utils'

export default function VereinbarungErstellenForm({
  vereinbarung,
  handleSave,
}: {
  vereinbarung?: VereinbarungEntry | null
  handleSave: (formValues: any) => Promise<void>
}) {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')

  const { register, control, handleSubmit } = useForm<any>()

  const [isLoading, setIsLoading] = useState(true)
  const [reportList, setReportList] = useState<{ id: string; name: string }[]>(
    []
  )

  useAsyncEffect(async () => {
    const { data: reportData } = await executeGET<{
      report: ReportDescription[]
    }>('/jasper/reports?reportType=schriftverkehr')

    if (reportData?.report && reportData.report.length) {
      const reportList = reportData.report.map(({ reportName }) => ({
        id: reportName,
        name: reportName,
      }))
      setReportList(reportList)
    }

    setIsLoading(false)
  }, [])

  const onSubmit = async (formValues: any) => {
    setIsLoading(true)

    await handleSave(formValues)

    setIsLoading(false)
  }

  return (
    <form
      className="flex flex-auto flex-col gap-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="relative grid flex-auto grid-cols-12 gap-x-12 gap-y-6">
        <div className="col-span-12 space-y-6">
          <h2 className="block text-xl">{t('label.createVereinbarung')}</h2>
        </div>
        <div className="col-span-12 flex flex-col space-y-6">
          <MitarbeiterSearchTw
            // TODO: integrate as form field value
            selectedEntry={
              vereinbarung
                ? ({
                    name: `${vereinbarung.vorname} ${vereinbarung.nachname}`,
                    personalnummer: vereinbarung.personalnummer,
                  } as MitarbeiterResult)
                : undefined
            }
            label={t('label.mitarbeiter')}
            placeholder={t('placeholder.mitarbeiter')}
            control={control}
            {...register('selectedMitarbeiter')}
          />
          <ComboSelectTw
            label={t('label.selectedVereinbarung')}
            options={convertToKeyLabelOptions(reportList)}
            placeholder={t('placeholder.selectedVereinbarung')}
            control={control}
            disabled={isLoading}
            {...register('selectedVereinbarung')}
          />
          <div className="flex gap-4">
            <div className="flex-auto">
              <DatepickerTw
                label={t('label.gueltigAb')}
                placeholder={t('placeholder.gueltigAb')}
                control={control}
                name={'gueltigAb'}
              />
            </div>
            <div className="flex-auto">
              <DatepickerTw
                label={t('label.gueltigBis')}
                placeholder={t('placeholder.gueltigBis')}
                control={control}
                name={'gueltigBis'}
              />
            </div>
          </div>
        </div>
      </div>
      <HorizontalRow />
      <div className="flex gap-4">
        <ButtonTw
          href="/mitarbeiter/vereinbarungen"
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
          secondary
        >
          {t('label.abbrechen')}
        </ButtonTw>
        <ButtonTw
          type="submit"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
        >
          {t('label.weiter')}
        </ButtonTw>
      </div>
    </form>
  )
}
