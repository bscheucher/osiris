import React from 'react'
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormRegisterReturn,
} from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { AnyObject, ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

export function addLeadingZeros(value: string | number) {
  let numberStr = value.toString().replace(/^0+/, '')
  if (numberStr.length > 10) {
    numberStr = numberStr.slice(0, 10)
  } else {
    const leadingZeroes = '0'.repeat(10 - numberStr.length)
    numberStr = leadingZeroes + numberStr
  }
  return numberStr
}

// core input component - standalone
export interface InputTextCoreProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  value?: string
  step?: string
  testId?: string
  decimals?: number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const InputTextCore = ({
  type = 'text',
  id,
  name,
  placeholder,
  disabled,
  autoFocus = false,
  className,
  step = 'any',
  testId,
  decimals,
  value = '',
  onChange,
  ...rest
}: InputTextCoreProps) => {
  // Helper function to validate decimal places
  const validateDecimals = (inputValue: string): string => {
    if (!decimals || type !== 'number') return inputValue

    const regex = new RegExp(`^-?\\d*\\.?\\d{0,${decimals}}$`)
    if (inputValue === '' || inputValue === '-') return inputValue

    // Handle backspace after decimal point
    if (inputValue.endsWith('.')) {
      return regex.test(inputValue) ? inputValue : inputValue.slice(0, -1)
    }

    return regex.test(inputValue)
      ? inputValue
      : inputValue.slice(0, inputValue.lastIndexOf('.') + decimals + 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedValue = validateDecimals(e.target.value)

    // Create a new event with the validated value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: validatedValue,
      },
    }

    if (onChange) {
      onChange(syntheticEvent)
    }
  }

  return (
    <input
      type={type}
      name={name}
      id={id}
      autoComplete="off"
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={placeholder}
      className={twMerge(
        `focus:ring-ibis-blue block h-10 w-full rounded-md border-0 bg-white px-3 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:text-gray-900 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-6`,
        className
      )}
      step={step}
      data-testid={testId || name}
      value={value}
      onChange={handleChange}
      {...rest}
    />
  )
}

// React Hook Form wrapper component
export interface InputProps<T extends FieldValues>
  extends Partial<UseFormRegisterReturn> {
  control: Control<T>
  id?: string
  type?: string
  name: Path<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  schema?: ObjectSchema<AnyObject>
  className?: string
  value?: string
  step?: string
  testId?: string
  decimals?: number
}

const InputTextTw = <T extends FieldValues>({
  control,
  type = 'text',
  id,
  name,
  label,
  placeholder,
  disabled,
  autoFocus = false,
  required,
  schema,
  className,
  step = 'any',
  testId,
  decimals,
  onChange,
  ...rest
}: InputProps<T>) => {
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
          <InputTextCore
            type={type}
            name={name}
            id={id || name}
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={placeholder}
            className={twMerge(
              label && 'mt-2',
              fieldState.error
                ? 'text-red-900 ring-2 ring-red-500 focus:ring-2'
                : 'ring-gray-300',
              className
            )}
            step={step}
            testId={testId}
            decimals={decimals}
            value={field.value || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange({
                target: {
                  value: e.target.value,
                },
                type: 'change',
              })
              if (onChange) {
                onChange({
                  target: {
                    value: e.target.value,
                  },
                  type: 'change',
                })
              }
            }}
            {...rest}
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

export default InputTextTw
