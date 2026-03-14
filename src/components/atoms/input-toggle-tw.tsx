import { Field, Label, Switch } from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

// Core toggle component - standalone
export interface ToggleCoreProps {
  id?: string
  name?: string
  leftLabel?: string
  rightLabel?: string
  testId?: string
  className?: string
  disabled?: boolean
  checked?: boolean
  onChange?: (value: boolean) => void
}

export const ToggleCore = forwardRef<HTMLButtonElement, ToggleCoreProps>(
  (
    {
      id,
      name,
      leftLabel,
      rightLabel,
      disabled,
      className,
      testId,
      checked = false,
      onChange,
    },
    ref
  ) => (
    <Field as="div" className="flex items-center" disabled={disabled}>
      {leftLabel && (
        <Label
          htmlFor={id || name}
          as="span"
          className="mr-2 text-sm"
          data-testid={`${testId || name}-leftLabel`}
        >
          <span className="font-medium text-gray-900">{leftLabel}</span>
        </Label>
      )}
      <Switch
        name={name}
        id={id || name}
        checked={checked}
        onChange={onChange}
        className={twMerge(
          checked ? 'bg-ibis-blue' : 'bg-gray-200',
          'focus:ring-ibis-blue relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300',
          className
        )}
        disabled={disabled}
        data-testid={testId || name}
        ref={ref}
      >
        <span
          aria-hidden="true"
          className={twMerge(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      {rightLabel && (
        <Label
          htmlFor={id || name}
          as="span"
          className="ml-2 text-sm"
          data-testid={`${testId || name}-rightLabel`}
        >
          <span className="font-medium text-gray-900">{rightLabel}</span>
        </Label>
      )}
    </Field>
  )
)

ToggleCore.displayName = 'ToggleCore'

// React Hook Form wrapper component
export interface InputProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  name: string
  label?: string
  leftLabel?: string
  rightLabel?: string
  schema?: ObjectSchema<any>
  testId?: string
  className?: string
  changeHandler?: (value: boolean) => void
}

const InputToggleTw = forwardRef<HTMLButtonElement, InputProps>(
  (
    {
      control,
      id,
      name,
      label,
      leftLabel,
      rightLabel,
      disabled,
      schema,
      required,
      className,
      testId,
    },
    ref
  ) => (
    <Controller
      control={control}
      name={name}
      defaultValue={false}
      render={({ field }) => (
        <Field as="div" className="flex flex-col" disabled={disabled}>
          {label && (
            <Label
              htmlFor={id || name}
              as="span"
              className="mb-2 text-sm"
              data-testid={`${testId || name}-label`}
            >
              <span className="font-medium text-gray-900">
                {getFormLabel(name, label, schema, required)}
              </span>
            </Label>
          )}
          <ToggleCore
            id={id || name}
            name={name}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            disabled={disabled}
            className={className}
            testId={testId}
            checked={!!field.value}
            onChange={(value: boolean) => field.onChange(value)}
            ref={ref}
          />
        </Field>
      )}
    />
  )
)

InputToggleTw.displayName = 'InputToggleTw'

export default InputToggleTw
