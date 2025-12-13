import React from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

export interface InputProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  name: string
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  rows?: number
  testId?: string
  schema?: ObjectSchema<any>
}

const TextareaTw = React.forwardRef<HTMLTextAreaElement, InputProps>(
  (
    {
      control,
      id,
      name,
      label,
      placeholder,
      className,
      disabled,
      required,
      schema,
      testId,
      autoFocus = false,
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
                className="block cursor-pointer text-sm leading-6 font-medium text-gray-900"
              >
                {getFormLabel(name, label, schema, required)}
              </label>
            )}
            <textarea
              {...field}
              value={field.value ?? ''} // Convert null/undefined to empty string
              name={name}
              id={id || name}
              autoComplete="off"
              autoFocus={autoFocus}
              disabled={disabled}
              placeholder={placeholder}
              data-testid={testId || name}
              className={twMerge(
                `block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`,
                label && 'mt-2',
                fieldState.error
                  ? 'text-red-900 ring-2 ring-red-500 focus:ring-red-500'
                  : 'focus:ring-ibis-blue ring-gray-300',
                disabled && 'bg-gray-100 text-gray-700',
                className
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

TextareaTw.displayName = 'TextareaTw'

export default TextareaTw
