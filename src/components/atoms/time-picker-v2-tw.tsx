import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { ReactNode, useRef } from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { IMaskInput, IMask } from 'react-imask'
import { twMerge } from 'tailwind-merge'
import { AnyObject, ObjectSchema } from 'yup'

import { getFormLabel } from '@/lib/utils/form-utils'

type TimePickerProps = {
  label?: ReactNode
  stepMinutes?: number
  name?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  required?: boolean
  schema?: ObjectSchema<AnyObject>
  testId?: string
}

export const TimePickerV2Tw = <T extends FieldValues>({
  stepMinutes = 1,
  disabled = false,
  placeholder = '00:00',
  label,
  name,
  required,
  className,
  schema,
  testId,
  ...controllerProps
}: TimePickerProps & UseControllerProps<T>) => {
  const { field, fieldState } = useController({ ...controllerProps, name })

  const timeString = field.value
    ? dayjs(field.value, 'HH:mm', true).format('HH:mm')
    : ''

  const maskInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const handleAccept = (val: string) => {
    if (val !== field.value && (val === '' || val.length === 5)) {
      field.onChange(val)
    }
  }

  const adjustTimeAtCursor = (direction: 1 | -1) => {
    if (!maskInputRef.current) return

    const pos = maskInputRef.current.selectionStart ?? 0
    const parsed = dayjs(timeString, 'HH:mm', true)
    const valid = parsed.isValid() ? parsed : dayjs('00:00', 'HH:mm')

    const isHour = pos <= 2 // Includes colon

    const adjusted = isHour
      ? valid.add(direction, 'hour')
      : valid.add(direction * stepMinutes, 'minute')

    const newTime = adjusted.format('HH:mm')
    field.onChange(newTime)

    // restore cursor position
    setTimeout(() => {
      maskInputRef.current?.setSelectionRange(pos, pos)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      adjustTimeAtCursor(1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      adjustTimeAtCursor(-1)
    }
  }

  const handleClick = () => {
    timeInputRef.current?.showPicker()
  }

  const handleClear = () => {
    field.onChange('')
  }

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value)
  }

  return (
    <>
      {label &&
        (typeof label === 'string' ? (
          <label
            className="block cursor-pointer text-sm leading-6 font-medium text-gray-900"
            htmlFor={field.name}
            data-testid={`${testId || field.name}-label`}
          >
            {getFormLabel(name, label, schema, required)}
          </label>
        ) : (
          label
        ))}
      <div
        className={twMerge(
          'relative flex w-auto items-center gap-2 rounded-md border-0 px-3 py-1.5 ring-1 ring-gray-300',
          `focus-within:ring-ibis-blue h-10 text-gray-900 placeholder:text-gray-400 focus-within:text-gray-900 focus-within:ring-1 focus-within:ring-inset sm:text-sm sm:leading-6`,
          disabled && 'cursor-not-allowed bg-gray-100 text-gray-700',
          label && 'mt-2',
          fieldState.error
            ? 'text-red-900 ring-2 ring-red-500 focus:ring-2'
            : 'ring-gray-300',
          className
        )}
      >
        <IMaskInput
          id={field.name}
          name={field.name}
          value={timeString}
          type="text"
          className="w-full border-none bg-transparent text-sm focus:border-none focus:ring-transparent focus:outline-none"
          inputRef={maskInputRef}
          mask="HH:mm"
          blocks={{
            HH: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              maxLength: 2,
              autofix: 'pad',
            },
            mm: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              maxLength: 2,
              autofix: 'pad',
            },
          }}
          lazy
          overwrite
          inputMode="numeric"
          onAccept={handleAccept}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={fieldState.error ? 'true' : 'false'}
          aria-describedby={
            fieldState.error ? `${field.name}-error` : undefined
          }
          data-testid={testId || field.name}
        />

        <div className="flex items-center gap-1">
          {timeString && (
            <button
              type="button"
              className={twMerge(
                'rounded text-gray-800',
                !timeString.length && 'invisible'
              )}
              onClick={handleClear}
              disabled={disabled}
            >
              <XMarkIcon className="size-5" />
            </button>
          )}
          <button
            type="button"
            className="relative cursor-pointer rounded text-gray-500"
            onClick={handleClick}
            disabled={disabled}
          >
            <ClockIcon className="size-5" />
          </button>
        </div>

        <input
          ref={timeInputRef}
          className="invisible absolute bottom-[-4] left-0 size-full"
          type="time"
          value={timeString}
          onChange={handleNativeInputChange}
          disabled={disabled}
          data-testid={`${testId || field.name}-picker-input`}
        />
      </div>
      {fieldState.error && (
        <span
          id={`${field.name}-error`}
          className="mt-2 block text-red-500"
          role="alert"
          data-testid={`${testId || field.name}-error`}
        >
          {fieldState.error.message}
        </span>
      )}
    </>
  )
}
