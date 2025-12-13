import React from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

export interface TextareaProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  rows?: number
  schema?: ObjectSchema<any>
  className?: string
  testId?: string
}

const TextareaSimpleTw = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      control,
      id,
      name,
      label,
      placeholder,
      disabled,
      autoFocus = false,
      schema,
      className,
      rows = 3,
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
        render={({ fieldState }) => (
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
            <textarea
              name={name}
              id={id || name}
              autoComplete="off"
              autoFocus={autoFocus}
              disabled={disabled}
              placeholder={placeholder}
              rows={rows}
              className={twMerge(
                `block resize-none border-0 border-b border-transparent bg-transparent p-0 pb-2 text-gray-900 outline-0 placeholder:text-gray-400`,
                label && 'mt-2',
                fieldState.error ? 'text-red-900' : '',
                className
              )}
              ref={ref}
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
)

TextareaSimpleTw.displayName = 'TextareaSimpleTw'

export default TextareaSimpleTw
