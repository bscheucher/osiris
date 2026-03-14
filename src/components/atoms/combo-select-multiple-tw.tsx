import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { forwardRef } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { getFormLabel, Option } from '@/lib/utils/form-utils'

interface ComboSelectProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  options: Option[]
  label?: string
  name: string
  placeholder?: string
  disabled?: boolean
  disableInput?: boolean
  optionsClassName?: string
  schema?: ObjectSchema<any>
  testId?: string
  defaultSelectedValue?: Option
}

export enum OptionCommand {
  Reset = 'reset',
  SelectAll = 'selectAll',
}

// TODO: Fix select all and reset
// this needs adjustment in the way values are passed through onchange

const ComboSelectMultipleTw = forwardRef<HTMLInputElement, ComboSelectProps>(
  (
    {
      control,
      options,
      label,
      disabled = false,
      placeholder = '',
      name,
      optionsClassName,
      schema,
      required,
      disableInput,
      testId = '',
      defaultSelectedValue,
    },
    ref
  ) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const selectedOptions =
            Array.isArray(field.value) && field.value.length > 0
              ? field.value
              : defaultSelectedValue
                ? [
                    options.find(
                      (option) => option.id === defaultSelectedValue.id
                    ),
                  ]
                : []
          return (
            <Field disabled={disabled}>
              {label && (
                <Label
                  className="block text-sm leading-6 font-medium text-gray-900"
                  data-testid={`${testId || name}-label`}
                >
                  {getFormLabel(name, label, schema, required)}
                </Label>
              )}
              <div className={twMerge('relative', label && 'mt-2')}>
                <Combobox
                  as="div"
                  multiple={true}
                  value={selectedOptions}
                  onChange={(options: Option[]) => field.onChange(options)}
                >
                  <ComboboxInput
                    disabled={disableInput}
                    className={twMerge(
                      `focus:ring-ibis-blue h-10 w-full rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`,
                      fieldState.error
                        ? 'ring-2 ring-red-500 focus:ring-2'
                        : 'ring-gray-300',
                      disabled && 'bg-gray-100 text-gray-700'
                    )}
                    displayValue={(options: Option[]) =>
                      options.length
                        ? options
                            .map((option: Option) => option.name)
                            .join(', ')
                        : ''
                    }
                    ref={ref}
                    placeholder={placeholder}
                    autoComplete="off"
                  />
                  <ComboboxButton
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                    data-testid={testId}
                  >
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                  {options.length > 0 && (
                    <ComboboxOptions
                      className={twMerge(
                        'ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm',
                        optionsClassName,
                        disabled && 'bg-gray-100 ring-gray-300'
                      )}
                    >
                      {options.map((option) => (
                        <ComboboxOption
                          disabled={disabled}
                          key={option.id}
                          value={option}
                          className={({ focus }) =>
                            twMerge(
                              'relative cursor-pointer py-2 pr-9 pl-3 select-none',
                              focus
                                ? 'bg-ibis-blue text-white'
                                : 'text-gray-900',
                              disabled && 'bg-gray-100 text-gray-900'
                            )
                          }
                        >
                          {({ focus, selected }) => (
                            <>
                              <span
                                className={twMerge(
                                  'block truncate',
                                  selected && 'font-semibold'
                                )}
                              >
                                {option.name}
                              </span>

                              {selected && (
                                <span
                                  className={twMerge(
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                    focus ? 'text-white' : 'text-ibis-blue',
                                    disabled && 'text-gray-900'
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
                      ))}
                    </ComboboxOptions>
                  )}
                </Combobox>
              </div>
              {fieldState.error && (
                <p className="mt-2 text-red-500">{fieldState.error.message}</p>
              )}
            </Field>
          )
        }}
      />
    )
  }
)

ComboSelectMultipleTw.displayName = 'ComboSelectMultipleTw'

export default ComboSelectMultipleTw
