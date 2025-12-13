import React, { FC } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

// Core checkbox component - standalone
export interface CheckboxCoreProps {
  id?: string
  name?: string
  label?: string
  description?: string
  disabled?: boolean
  className?: string
  testId?: string
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const CheckboxCore: FC<CheckboxCoreProps> = ({
  id,
  name,
  label,
  description,
  disabled,
  className,
  testId,
  checked = false,
  onChange,
}) => {
  return (
    <div className={twMerge('relative flex items-start', className)}>
      <div className="mt-1 flex items-center">
        <input
          id={id || name}
          name={name}
          disabled={disabled}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="text-ibis-blue h-6 w-6 appearance-none rounded border border-gray-300 bg-white outline-offset-3 focus:outline-2 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700 disabled:checked:bg-gray-100"
          data-testid={testId || name}
        />
      </div>
      <div className="mt-1 ml-3 text-sm leading-6">
        {label && (
          <label
            htmlFor={id || name}
            className={twMerge(
              'block cursor-pointer text-sm leading-6 font-medium text-gray-900',
              disabled && 'cursor-not-allowed'
            )}
            data-testid={`${testId || name}-label`}
          >
            {label}
          </label>
        )}
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  )
}

CheckboxCore.displayName = 'CheckboxCore'

// React Hook Form wrapper component
export interface InputCheckboxTw extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  name: string
  label?: string
  description?: string
  disabled?: boolean
  schema?: ObjectSchema<any>
  className?: string
  testId?: string
}

const InputCheckboxTw: FC<InputCheckboxTw> = ({
  control,
  id,
  name,
  label,
  description,
  disabled,
  schema,
  required,
  className,
  testId,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="relative">
          <CheckboxCore
            id={id || name}
            name={name}
            label={
              label ? getFormLabel(name, label, schema, required) : undefined
            }
            description={description}
            disabled={disabled}
            className={twMerge(
              fieldState.error
                ? 'focus:ring-ibis-blue focus:outline-ibis-blue text-red-500 ring-2 ring-red-500 ring-offset-3 outline-red-500'
                : '',
              className
            )}
            testId={testId}
            checked={field.value || false}
            onChange={field.onChange}
          />
          {fieldState.error && (
            <p
              className="mt-2 text-red-500"
              data-testid={`${testId || name}-error`}
            >
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}

InputCheckboxTw.displayName = 'InputCheckboxTw'

export default InputCheckboxTw
