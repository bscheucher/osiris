import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from '@headlessui/react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'
import { forwardRef, useMemo, useState } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'

interface ComboSelectProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  options: KeyLabelOption[]
  label?: string
  name: string
  id?: string
  placeholder?: string
  disabled?: boolean
  optionsClassName?: string
  schema?: ObjectSchema<any>
  testId?: string
}

const getOptionFromValue = (options: KeyLabelOption[], value?: string | null) =>
  options.find((option) => option.key === value) || null

const addDefaultOption = (options: KeyLabelOption[], label: string) => [
  { key: '', label },
  ...options,
]

const ComboSelectTw = forwardRef<HTMLInputElement, ComboSelectProps>(
  (
    {
      control,
      options,
      label,
      disabled = false,
      placeholder = '',
      name,
      id,
      optionsClassName,
      schema,
      required,
      testId,
    },
    ref
  ) => {
    const t = useTranslations('components.comboSelect')
    const resetLabel = useMemo(() => t('zuruecksetzen'), [])
    const [query, setQuery] = useState('')

    const filteredOptions =
      query === ''
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
          )

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Field disabled={disabled}>
            {label && (
              <Label
                className="block cursor-pointer text-sm leading-6 font-medium text-gray-900"
                data-testid={`${testId || name}-label`}
              >
                {getFormLabel(name, label, schema, required)}
              </Label>
            )}
            <div className={twMerge('relative', label && 'mt-2')}>
              <Combobox
                as="div"
                virtual={{
                  options: addDefaultOption(filteredOptions, resetLabel),
                }}
                value={getOptionFromValue(options, field.value)}
                onChange={(option: KeyLabelOption) => {
                  field.onChange(option ? option.key : '')
                }}
                onClose={() => setQuery('')}
                className="relative"
              >
                <ComboboxInput
                  className={twMerge(
                    `focus:ring-ibis-blue h-10 w-full rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-6`,
                    fieldState.error ? 'ring-2 ring-red-600' : 'ring-gray-300'
                  )}
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(option: KeyLabelOption) =>
                    option ? option.label : ''
                  }
                  placeholder={placeholder}
                  autoComplete="off"
                  id={`${id || name}`}
                  data-testid={`${testId || name}`}
                  ref={ref}
                />
                <ComboboxButton
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none disabled:cursor-not-allowed"
                  data-testid={`${testId || name}-button`}
                >
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </ComboboxButton>
                {filteredOptions.length > 0 && (
                  <ComboboxOptions
                    className={twMerge(
                      'ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border-0 bg-white py-1 text-base shadow-lg ring-1 ring-gray-300 empty:invisible focus:outline-none sm:text-sm',
                      optionsClassName
                    )}
                  >
                    {({ option }) => {
                      // return custom option for reset label
                      if (option.label === resetLabel) {
                        return (
                          <ComboboxOption
                            key={'-1'}
                            value={null}
                            className={({ focus }) =>
                              twMerge(
                                'relative w-full cursor-pointer py-2 pr-9 pl-3 select-none',
                                focus
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'text-gray-400'
                              )
                            }
                          >
                            <span className="block truncate">{resetLabel}</span>
                            <span
                              className={
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              }
                            >
                              <XMarkIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </span>
                          </ComboboxOption>
                        )
                      }

                      return (
                        <ComboboxOption
                          key={option.key}
                          value={option}
                          className={({ focus }) =>
                            twMerge(
                              'relative w-full cursor-pointer py-2 pr-9 pl-3 select-none',
                              focus
                                ? 'bg-ibis-blue text-white'
                                : 'text-gray-900'
                            )
                          }
                          data-testid={`${testId || name}-option-${option.label}`}
                        >
                          {({ focus, selected }) => (
                            <>
                              <span
                                className={twMerge(
                                  'block truncate',
                                  selected && 'font-semibold'
                                )}
                              >
                                {option.label}
                              </span>

                              {selected && (
                                <span
                                  className={twMerge(
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                    focus ? 'text-white' : 'text-ibis-blue'
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </ComboboxOption>
                      )
                    }}
                  </ComboboxOptions>
                )}
              </Combobox>
            </div>

            {fieldState.error && (
              <p
                className="mt-2 text-red-500"
                data-testid={`${testId || name}-error`}
              >
                {fieldState.error.message}
              </p>
            )}
          </Field>
        )}
      />
    )
  }
)

ComboSelectTw.displayName = 'ComboSelectTw'

export default ComboSelectTw
