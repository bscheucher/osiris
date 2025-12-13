import { Field, Label } from '@headlessui/react'
import React from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

export interface InputRadioGroupProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  name: string
  label?: string
  disabled?: boolean
  options: { value: string; label?: string }[]
  schema?: ObjectSchema<any>
  testId?: string
}

const InputRadioGroupTw = React.forwardRef<
  HTMLDivElement,
  InputRadioGroupProps
>(
  (
    { control, id, name, label, disabled, options, schema, required, testId },
    ref
  ) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <div ref={ref}>
            <Field as="div" className="flex flex-col" disabled={disabled}>
              {label && (
                <Label
                  as="span"
                  className="mb-2 text-sm"
                  data-testid={`${testId || name}-label`}
                >
                  <span className="cursor-pointer font-medium text-gray-900">
                    {getFormLabel(name, label, schema, required)}
                  </span>
                </Label>
              )}
              {options.map((option) => (
                <label
                  key={option.value}
                  className={twMerge(
                    'mt-2 flex items-center',
                    disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  )}
                >
                  <input
                    type="radio"
                    id={`${id || name}-${option.value}`}
                    name={name}
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    className="sr-only"
                    disabled={disabled}
                  />
                  <span
                    className={twMerge(
                      'inline-block h-6 w-6 rounded-full border-2 transition-colors duration-200 ease-in-out',
                      field.value === option.value
                        ? 'border-ibis-blue bg-ibis-blue'
                        : 'border-gray-300 bg-white',
                      'flex items-center justify-center'
                    )}
                  >
                    {field.value === option.value && (
                      <span className="block h-3 w-3 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </Field>
            {fieldState.error && (
              <p
                className="mt-2 text-red-500"
                data-testid={`${testId || name}-error`}
              >
                {fieldState.error.message}{' '}
              </p>
            )}
          </div>
        )}
      />
    )
  }
)

InputRadioGroupTw.displayName = 'InputRadioGroupTw'

export default InputRadioGroupTw
