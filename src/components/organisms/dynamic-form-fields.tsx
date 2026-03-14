import React from 'react'
import {
  Control,
  FieldValues,
  useFieldArray,
  UseFormRegister,
} from 'react-hook-form'

import { TimePickerV2Tw } from '../atoms/time-picker-v2-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import DescriptionSectionTw from '@/components/molecules/description-section-tw'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'

export interface ReportDescription {
  id: string
  mainReportFile: string
  reportName: string
  sourcePath: string
}

export interface ReportFormField {
  type: 'DATE' | 'SELECT' | 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'TIME'
  name: string
  label: string
  description?: string
  required?: boolean
  options?: Array<{ id: string; name: string }>
  placeholder?: string
  value: string | number | null
}

export interface FormValues {
  [key: string]: string | number
}

interface Props {
  formDefinition: ReportFormField[]
  control: Control<FieldValues, any>
  register: UseFormRegister<FieldValues>
  isLoading?: boolean
  fieldArrayKey?: string
}

export const mapValuesToFormFields = (
  formFields: ReportFormField[],
  values: FormValues[]
): ReportFormField[] => {
  return formFields.map((field, index) => ({
    ...field,
    value: values[index].value ?? null,
  }))
}

const getPlaceholderByType = (label: string, type: string) => {
  switch (type) {
    case 'DATE':
      return `Datum auswählen`

    case 'TIME':
      return `Zeit auswählen`

    case 'SELECT':
    case 'BOOLEAN':
      return `${label} auswählen`

    default:
      return `${label} eingeben`
  }
}

const convertBooleanValue = (value: ReportFormField['value']) => {
  if (typeof value === 'string') {
    return value === 'true' ? true : value === 'false' ? false : value
  }
  return value
}

const getInputComponentByType = (field: ReportFormField, commonProps: any) => {
  switch (field.type) {
    case 'DATE':
      return <DatepickerTw {...commonProps} />

    case 'TIME':
      return <TimePickerV2Tw {...commonProps} />

    case 'SELECT':
      return (
        <InputSelectTw
          {...commonProps}
          options={convertToKeyLabelOptions(field.options)}
        />
      )
    case 'NUMBER':
      return <InputTextTw {...commonProps} type="number" />

    case 'BOOLEAN':
      return (
        <InputToggleTw
          {...commonProps}
          value={convertBooleanValue(field.value)}
        />
      )

    default:
      return <InputTextTw {...commonProps} />
  }
}

const DynamicFormFields = ({
  formDefinition,
  control,
  register,
  fieldArrayKey = 'parameters',
}: Props) => {
  const { fields } = useFieldArray({
    control,
    name: fieldArrayKey,
  })

  const renderField = (field: ReportFormField, index: number) => {
    const label = field.label || field.name

    const commonProps = {
      label,
      placeholder: field.placeholder || getPlaceholderByType(label, field.type),
      control: control as Control<any>,
      required: field.required,
      description: field.description,
      ...register(`${fieldArrayKey}.${index}.value`, {
        required:
          field.required && field.type !== 'BOOLEAN'
            ? `"${label}" ist ein Pflichtfeld.`
            : false,
      }),
    }

    return (
      <div className="flex flex-col">
        {getInputComponentByType(field, commonProps)}
        {commonProps.description && (
          <DescriptionSectionTw
            className="mt-4"
            description={commonProps.description}
          />
        )}
      </div>
    )
  }

  return formDefinition.map((field, index) => (
    <React.Fragment key={index}>{renderField(field, index)}</React.Fragment>
  ))
}

export default DynamicFormFields
