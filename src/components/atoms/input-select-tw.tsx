import React from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { AnyObject, ObjectSchema } from 'yup'

import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'

// Core select component - standalone
export interface SelectCoreProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  id?: string
  placeholder?: string
  disabled?: boolean
  options: KeyLabelOption[]
  testId?: string
  className?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
}

export const SelectCore = ({
  id,
  name,
  placeholder,
  disabled,
  options,
  className,
  testId,
  value = '',
  onChange,
  onBlur,
  ...rest
}: SelectCoreProps) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete="off"
      disabled={disabled}
      className={twMerge(
        `focus:ring-ibis-blue block h-10 w-full rounded-md border-0 bg-white px-3 py-1.5 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-6`,
        value ? 'text-gray-900' : 'text-gray-400',
        className
      )}
      data-testid={testId || name}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(({ key, label }) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}

SelectCore.displayName = 'SelectCore'

// React Hook Form wrapper component
interface Props<T extends FieldValues> {
  control: Control<T>
  id?: string
  name: Path<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  options: KeyLabelOption[]
  schema?: ObjectSchema<AnyObject>
  testId?: string
  required?: boolean
  className?: string
}

const InputSelectTw = <T extends FieldValues>({
  control,
  id,
  name,
  label,
  placeholder,
  disabled,
  options,
  schema,
  className,
  required,
  testId,
}: Props<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
          {label && (
            <label
              htmlFor={id || name}
              className="block cursor-pointer text-sm leading-6 font-medium text-gray-900"
              data-testid={`${testId || name}-label`}
            >
              {getFormLabel(name, label, schema, required)}
            </label>
          )}
          <SelectCore
            id={id || name}
            name={field.name}
            placeholder={placeholder}
            disabled={disabled}
            options={options}
            className={twMerge(
              fieldState.error
                ? 'ring-2 ring-red-500 focus:ring-2'
                : 'ring-gray-300',
              label && 'mt-2',
              className
            )}
            testId={testId}
            value={field.value || ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          {fieldState.error && (
            <p
              className="mt-2 text-red-500"
              data-testid={`${testId || name}-error`}
            >
              {fieldState.error.message}
            </p>
          )}
        </>
      )}
    />
  )
}

InputSelectTw.displayName = 'InputSelectTw'

export default InputSelectTw
