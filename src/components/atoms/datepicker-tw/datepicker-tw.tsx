'use client'

import { CalendarDaysIcon } from '@heroicons/react/20/solid'
import { de } from 'date-fns/locale/de'
import { enGB } from 'date-fns/locale/en-GB'
import dayjs from 'dayjs'
import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

registerLocale('de', de)
registerLocale('en', enGB)

const valueToDate = (value?: string) => (value ? dayjs(value).toDate() : null)

const dateToValue = (date: Date | null) =>
  date ? dayjs(date).format('YYYY-MM-DD') : null

// Core datepicker component - standalone
export interface DatepickerCoreProps {
  id?: string
  name?: string
  placeholder?: string
  locale?: string
  disabled?: boolean
  testId?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  selected?: Date | null
  onChange?: (date: Date | null) => void
  dateFormat?: string
}

export const DatepickerCore = ({
  id,
  name,
  placeholder,
  locale = 'de',
  disabled,
  className,
  testId,
  minDate,
  maxDate,
  selected = null,
  onChange,
  dateFormat = 'dd.MM.yyyy',
}: DatepickerCoreProps) => {
  return (
    <div className="relative">
      <DatePicker
        name={name}
        id={id || name}
        dateFormat={dateFormat}
        selected={selected}
        onChange={onChange}
        autoComplete="off"
        disabled={disabled}
        placeholderText={placeholder}
        className={twMerge(
          `focus:ring-ibis-blue block h-10 w-full rounded-md border-0 py-1.5 pr-3 pl-10 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-6`,
          className
        )}
        locale={locale}
        data-testid={testId || name}
        minDate={minDate}
        maxDate={maxDate}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center px-3.5">
        <CalendarDaysIcon
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

DatepickerCore.displayName = 'DatepickerCore'

// React Hook Form wrapper component
export interface InputProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  id?: string
  type?: string
  name: string
  label?: string
  placeholder?: string
  locale?: string
  disabled?: boolean
  schema?: ObjectSchema<any>
  testId?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DatepickerTw = ({
  control,
  id,
  name,
  label,
  placeholder,
  locale = 'de',
  disabled,
  required,
  schema,
  className,
  testId,
  minDate,
  maxDate,
}: InputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
          {label && (
            <label
              htmlFor={name}
              className="block text-sm leading-6 font-medium text-gray-900"
            >
              {getFormLabel(name, label, schema, required)}
            </label>
          )}
          <div className={twMerge(label && 'mt-2')}>
            <DatepickerCore
              id={id || name}
              name={name}
              placeholder={placeholder}
              locale={locale}
              disabled={disabled}
              className={twMerge(
                fieldState.error ? 'ring-2 ring-red-500' : 'ring-gray-300',
                className
              )}
              testId={testId}
              minDate={minDate}
              maxDate={maxDate}
              selected={valueToDate(field.value)}
              onChange={(date) => field.onChange(dateToValue(date))}
            />
          </div>
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

DatepickerTw.displayName = 'DatepickerTw'

export default DatepickerTw
