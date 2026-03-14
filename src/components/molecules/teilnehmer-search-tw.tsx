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
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { AnyObject, ObjectSchema } from 'yup'

import { useDebounceCallback } from '@/hooks/use-debounce'
import { Teilnehmer } from '@/lib/interfaces/teilnehmer'
import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'
import { executeGET, toQueryString } from '@/lib/utils/gateway-utils'

export type SelectedEntry = Pick<
  Teilnehmer,
  'id' | 'vorname' | 'nachname' | 'svNummer'
> &
  Partial<Omit<Teilnehmer, 'id' | 'vorname' | 'nachname' | 'svNummer'>>

interface TeilnehmerSearchProps<T extends FieldValues> {
  control: Control<T>
  label?: string
  name: Path<T>
  placeholder?: string
  disabled?: boolean
  optionsClassName?: string
  schema?: ObjectSchema<AnyObject>
  testId?: string
  selectedEntry?: SelectedEntry
}

async function fetchTeilnehmerOptions(
  page: string,
  size: string,
  searchTerm: string
) {
  return executeGET<{ teilnehmer: Teilnehmer[] }>(
    `/teilnehmer/search${toQueryString({
      page,
      size,
      searchTerm,
    })}`
  )
    .then(({ data }) => {
      if (!data?.teilnehmer) {
        throw new Error('No data found')
      }
      return {
        teilnehmerSearchResults: data?.teilnehmer ? data?.teilnehmer : [],
      }
    })
    .catch((error) => {
      throw error
    })
}

const convertToKeyLabelOption = (
  teilnehmerList: SelectedEntry[]
): KeyLabelOption[] =>
  teilnehmerList.map(({ id, vorname, nachname, svNummer }) => ({
    key: id.toString(),
    label: `${vorname} ${nachname}${svNummer ? ` (${svNummer})` : ''}`,
  }))

export const TeilnehmerSearchTw = <T extends FieldValues>({
  control,
  label,
  disabled = false,
  placeholder = '',
  name,
  optionsClassName,
  schema,
  testId = '',
  selectedEntry,
}: TeilnehmerSearchProps<T>) => {
  const t = useTranslations('components.teilnehmer.search')

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<KeyLabelOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)

      if (searchQuery.length < 4) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { teilnehmerSearchResults } = await fetchTeilnehmerOptions(
          '0',
          '50',
          searchQuery
        )

        const teilnehmerOptions = convertToKeyLabelOption(
          teilnehmerSearchResults
        )
        setOptions(teilnehmerOptions)
      } catch (e) {
        setError(t('error.laden'))
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    },
    [t]
  )
  const debouncedSearch = useDebounceCallback(handleSearch, 300)

  useEffect(() => {
    if (selectedEntry) {
      setOptions(convertToKeyLabelOption([{ ...selectedEntry }]))
    }
  }, [selectedEntry])

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
                field.onChange(option ? option.key : null)
              }
            >
              <ComboboxInput
                className={twMerge(
                  `focus:ring-ibis-blue h-10 w-full rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`,
                  fieldState.error ? 'ring-2 ring-red-600' : 'ring-gray-300',
                  disabled && 'bg-gray-100 text-gray-700'
                )}
                onChange={(event) => debouncedSearch(event.target.value)}
                displayValue={(option: KeyLabelOption) => option?.label || ''}
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
