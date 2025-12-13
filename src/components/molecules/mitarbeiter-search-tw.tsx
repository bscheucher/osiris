import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from '@headlessui/react'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import debounce from 'lodash/debounce'
import { forwardRef, useEffect, useState } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import { MitarbeiterResult } from '@/lib/interfaces/mitarbeiter'
import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'

interface MitarbeiterSearchProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  label?: string
  name: string
  placeholder?: string
  disabled?: boolean
  optionsClassName?: string
  schema?: ObjectSchema<any>
  testId?: string
  selectedEntry?: MitarbeiterResult | null
}

const convertToKeyLabelOption = (
  mitarbeiterList: MitarbeiterResult[]
): KeyLabelOption[] =>
  mitarbeiterList.map(({ personalnummer, name, svnr }) => ({
    key: personalnummer.toString(),
    label: `${name}${svnr ? ` (${svnr})` : ``}`,
  }))

const MitarbeiterSearchTw = forwardRef<
  HTMLInputElement,
  MitarbeiterSearchProps
>(
  (
    {
      control,
      label,
      disabled = false,
      placeholder = '',
      name,
      optionsClassName,
      schema,
      testId = '',
      selectedEntry,
    },
    ref
  ) => {
    const [query, setQuery] = useState('')
    const [options, setOptions] = useState<KeyLabelOption[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      if (selectedEntry) {
        setOptions(convertToKeyLabelOption([selectedEntry]))
      }
    }, [selectedEntry])

    const debouncedSearch = debounce(async (searchQuery: string) => {
      if (searchQuery.length < 4) {
        return
      }

      setIsLoading(true)
      setError(null)

      const { data } = await executeGET<{ maFiltered: MitarbeiterResult[] }>(
        `/ma-verwalten/search${toQueryString({
          page: 0,
          size: 50,
          searchTerm: searchQuery,
        })}`
      )

      if (data?.maFiltered) {
        setOptions(convertToKeyLabelOption(data.maFiltered))
      } else {
        setOptions([])
      }
      setIsLoading(false)
    }, 300)

    useEffect(() => {
      debouncedSearch(query)

      return () => {
        debouncedSearch.cancel()
      }
    }, [query])

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Field disabled={disabled}>
            {label && (
              <Label className="block text-sm leading-6 font-medium text-gray-900">
                {getFormLabel(name, label, schema)}
              </Label>
            )}
            <div className={twMerge('relative', label && 'mt-2')}>
              <Combobox
                as="div"
                value={
                  options.find(
                    (option) => option.key === field.value?.toString()
                  ) || null
                }
                onChange={(option: KeyLabelOption) =>
                  field.onChange(option ? option.key : '')
                }
              >
                <ComboboxInput
                  className={twMerge(
                    `focus:ring-ibis-blue h-10 w-full rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`,
                    fieldState.error ? 'ring-2 ring-red-600' : 'ring-gray-300',
                    disabled && 'bg-gray-100 text-gray-700'
                  )}
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(option: KeyLabelOption) => option?.label || ''}
                  ref={ref}
                  placeholder={placeholder}
                  autoComplete="off"
                />
                <ComboboxButton
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                  data-testid={testId}
                >
                  {isLoading ? (
                    <div className="border-t-ibis-blue h-5 w-5 animate-spin rounded-full border-2 border-gray-300" />
                  ) : (
                    <MagnifyingGlassIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </ComboboxButton>

                {query.length >= 4 && options.length > 0 && (
                  <ComboboxOptions
                    className={twMerge(
                      'ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm',
                      optionsClassName
                    )}
                  >
                    {options.map((option) => (
                      <ComboboxOption
                        key={option.key}
                        value={option}
                        className={({ focus }) =>
                          twMerge(
                            'relative cursor-pointer py-2 pr-9 pl-3 select-none',
                            focus ? 'bg-ibis-blue text-white' : 'text-gray-900'
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
                    ))}
                  </ComboboxOptions>
                )}

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </Combobox>
            </div>
            {fieldState.error && (
              <p className="mt-2 text-red-500">{fieldState.error.message}</p>
            )}
          </Field>
        )}
      />
    )
  }
)

MitarbeiterSearchTw.displayName = 'MitarbeiterSearchTw'

export default MitarbeiterSearchTw
