import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DynamicFormFields, {
  ReportFormField,
} from '@/components/organisms/dynamic-form-fields'

export interface ReportDescription {
  id: string
  mainReportFile: string
  reportName: string
  sourcePath: string
}
interface Props {
  formDefinition: ReportFormField[]
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

const DynamicReportForm = ({
  formDefinition,
  onSubmit,
  isLoading = false,
}: Props) => {
  const t = useTranslations('reports')

  const { handleSubmit, control, register } = useForm()

  if (!formDefinition) {
    return <div>{t('labels.noResults')}</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8 space-y-6">
        <div className="mb-6 flex content-center items-center justify-between">
          <h3 className="text-xl text-gray-900">
            {t('labels.reportSettings')}
          </h3>
        </div>

        <div>
          <div className="flex flex-col gap-x-8 gap-y-6">
            <DynamicFormFields
              control={control}
              isLoading={isLoading}
              formDefinition={formDefinition}
              register={register}
            />
          </div>
        </div>
      </div>
      <ButtonTw
        type="submit"
        className="flex w-full justify-center"
        size={ButtonSize.Large}
        disabled={isLoading}
        isLoading={isLoading}
        testId="report-generate-button"
      >
        {t('labels.reportErzeugen')}
      </ButtonTw>
    </form>
  )
}

export default DynamicReportForm
