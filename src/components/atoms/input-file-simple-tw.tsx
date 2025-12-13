import React from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

export interface InputProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  personalnummer?: string
  id?: string
  type?: string
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  schema?: ObjectSchema<any>
  className?: string
  testId?: string
}

const InputFileSimpleTw = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      control,
      id,
      name,
      label,
      placeholder,
      personalnummer,
      disabled,
      schema,
      required,
      testId,
      ...rest
    },
    ref
  ) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            {label && (
              <label
                htmlFor={id || name}
                className="block text-sm leading-6 font-medium text-gray-900"
                data-testid={`${testId || name}-label`}
              >
                {getFormLabel(name, label, schema, required)}
              </label>
            )}
            <input
              type="file"
              name={name}
              id={id}
              autoComplete="off"
              disabled={disabled}
              placeholder={placeholder}
              className={twMerge(
                `focus:ring-ibis-blue mt-2 block h-10 w-full rounded-md border-0 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-5`,
                fieldState.error
                  ? 'text-red-900 ring-2 ring-red-500 focus:ring-2'
                  : 'ring-gray-300'
              )}
              ref={ref}
              {...rest}
            />

            {fieldState.error && (
              <p className="mt-2 text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    )
  }
)

InputFileSimpleTw.displayName = 'InputFileSimpleTw'

export default InputFileSimpleTw
