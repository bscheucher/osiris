import { ReadonlyURLSearchParams } from 'next/navigation'
import { UseFormSetError } from 'react-hook-form'
import * as yup from 'yup'

import { SeminarWithData } from './teilnehmer-utils'

// key is the value passed to the backend
// label is what we show
export interface KeyLabelOption {
  key: string
  label: string
  description?: string
}

// only needed for multiselect until refactored
export interface Option {
  id: number | string
  name: string
}

export const convertArrayToOptions = (
  list?: string[] | { [key: string]: string } | null
): Option[] => {
  return list && Array.isArray(list)
    ? list.map((item, index) => ({ id: index + 1, name: item }))
    : []
}

export const convertArrayToKeyLabelOptions = (
  list?: string[] | { [key: string]: string } | null
): KeyLabelOption[] => {
  return list && Array.isArray(list)
    ? list.map((item) => ({ key: item, label: item }))
    : []
}

export const convertToKeyLabelOptions = (
  list?:
    | string[]
    | { id: number | string; name: string }[]
    | { [key: string]: string }
    | null
): KeyLabelOption[] => {
  if (list && Array.isArray(list)) {
    return list.map((item) => {
      if (typeof item === 'string') {
        return { key: item, label: item }
      }

      if (item?.id && item?.name) {
        return { key: item.id.toString(), label: item.name }
      }

      return { key: '', label: '' }
    })
  }

  if (list && typeof list === 'object') {
    return Object.values(list).map((value) => ({ key: value, label: value }))
  }

  return []
}

export const getTranslationKeyForType = (
  value: string,
  additionalTranslationKey?: string
) => {
  return additionalTranslationKey !== undefined &&
    additionalTranslationKey !== ''
    ? `${additionalTranslationKey}.${value.toLowerCase()}`
    : `${value.toLowerCase()}`
}

// ENUMS

export const convertEnumToKeyValueArray = <T extends { [key: string]: string }>(
  enumObj: T
): Array<{ key: T[keyof T]; label: string }> => {
  return Object.keys(enumObj).map((key) => ({
    key: enumObj[key as keyof T],
    label: enumObj[key as keyof T],
  }))
}

export const convertEnumToKeyLabelOptions = (
  enumObject: { [key: string]: string },
  t: (key: string) => string,
  additionalTranslationKey?: string
): KeyLabelOption[] => {
  return Object.entries(enumObject)
    .map(([key, value]) => {
      const translationKey = getTranslationKeyForType(
        value,
        additionalTranslationKey
      )
      return { key: key, label: t(translationKey) }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

// TODO: find reusable solution that can used for other Enums
export const convertEnumToOptions = (
  enumObject: { [key: string]: string },
  t: (key: string) => string,
  additionalTranslationKey?: string
): Option[] => {
  return Object.entries(enumObject).map(([key, value]) => {
    const translationKey = getTranslationKeyForType(
      value,
      additionalTranslationKey
    )
    return { id: key, name: t(translationKey) }
  })
}

export const getKeyLabelOptionsFromSeminarList = (
  seminars?: SeminarWithData[] | null
): KeyLabelOption[] =>
  seminars
    ? seminars.map((seminar) => ({
        key: seminar?.id.toString(),
        label: seminar?.seminarBezeichnung,
      }))
    : []

export const getOptionsFromSeminarList = (
  seminars?: SeminarWithData[] | null
) =>
  seminars
    ? convertArrayToKeyLabelOptions(
        seminars.map((seminar) => seminar?.seminarBezeichnung)
      )
    : []

export const getSeminarsWithDataFromOptions = (
  allSeminars?: SeminarWithData[] | null,
  seminarsOptions?: Option[] | null
) => {
  if (!allSeminars || !seminarsOptions) {
    return []
  }

  return (seminarsOptions.map((option) =>
    allSeminars.find((seminar) => seminar.id === option.id)
  ) || []) as SeminarWithData[]
}

export const isFieldRequired = (
  fieldName: string,
  schema?: yup.ObjectSchema<any>
) => {
  if (schema) {
    const fieldSchema = schema.describe().fields[
      fieldName
    ] as yup.SchemaDescription

    return !fieldSchema?.optional
  }

  return false

  // more explicit notation
  // return fieldSchema.tests.some((test) => test.name === 'required');
}

export const getLabelContent = (label: string, required: boolean) =>
  required ? `${label}*` : label

export const getFormLabel = (
  fieldName: string,
  label: string,
  schema?: yup.ObjectSchema<any>,
  required?: boolean
) => {
  const isRequired = required || isFieldRequired(fieldName, schema)

  return getLabelContent(label, isRequired)
}

export const setErrorsFromErrorsMap = (
  errorsMap: Record<string, string>,
  setError: UseFormSetError<any>,
  ignoredKeys: string[] = []
) => {
  Object.entries(errorsMap).forEach(([fieldName, errorMessage]) => {
    if (!ignoredKeys.includes(fieldName)) {
      setError(fieldName, { type: 'server', message: errorMessage })
    }
  })
}

export function stripErrorsFromPayload<T>(payload: T): T {
  if (payload === null || payload === undefined) {
    return payload
  }

  if (Array.isArray(payload)) {
    return payload.map(stripErrorsFromPayload) as unknown as T
  }

  if (typeof payload === 'object') {
    const result = {} as Record<string, any>

    for (const [key, value] of Object.entries(payload)) {
      if (key === 'errors' || key === 'errorsMap') {
        continue
      }

      result[key] = stripErrorsFromPayload(value)
    }

    return result as T
  }

  return payload
}

export function parseEmailAddresses(emailString: string): string[] {
  if (!emailString || typeof emailString !== 'string') {
    return []
  }

  const emails = emailString
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0)

  return [...new Set(emails)]
}

export const getSearchParamsObject = <T extends Record<string, any>>(
  searchParams: ReadonlyURLSearchParams,
  defaultValues?: T
): {
  searchParamsObject: Partial<T>
  hasSearchParams: boolean
  filterCount: number
} => {
  // Create an empty object to store the search parameters
  const searchParamsObject: Partial<T> = {}

  // If defaultValues are provided, use them to determine which parameters to extract
  const keysToExtract = defaultValues
    ? Object.keys(defaultValues)
    : [...searchParams.keys()]

  // Populate the object with values from search parameters
  keysToExtract.forEach((key) => {
    const value = searchParams.get(key) || ''
    // only if they contain a value
    if (value) {
      searchParamsObject[key as keyof T] = value as any
    }
  })

  // Convert string "true" and "false" to boolean values
  Object.keys(searchParamsObject).forEach((key) => {
    const value = searchParamsObject[key as keyof T]
    if (value === 'true') {
      searchParamsObject[key as keyof T] = true as any
    } else if (value === 'false') {
      searchParamsObject[key as keyof T] = false as any
    }
  })

  // Check if there are any non-empty search parameters
  const hasSearchParams = Object.keys(searchParamsObject).some((key) =>
    Boolean(searchParamsObject[key as keyof T])
  )

  // Count the number of active filters (non-empty values that aren't 'searchTerm' etc.)
  const excludedKeys = ['identifiersString', 'searchTerm']
  const filterCount = Object.entries(searchParamsObject).filter(
    ([key, value]) =>
      !excludedKeys.includes(key) && value && String(value).trim() !== ''
  ).length

  return { searchParamsObject, hasSearchParams, filterCount }
}
