import { UseFormWatch } from 'react-hook-form'

const INGORED_KEYS = [
  'errors',
  'errorsMap',
  'alter',
  'kompetenzen',
  'praktika',
  'abschluesse',
  'wunschberufe',
  'stammdaten',
  'vertragsdaten',
  'vereinbarungUEberstunden',
]

const customIsEqual = (obj1: any, obj2: any, debug = false) => {
  if (!obj1 || !obj2) {
    return false
  }

  const allKeys = new Set(
    [...Object.keys(obj1), ...Object.keys(obj2)].filter(
      (key) => !INGORED_KEYS.includes(key)
    )
  )

  if (debug) console.group('Object Differences')

  let isEqual = true

  allKeys.forEach((key) => {
    const value1 = obj1[key]
    const value2 = obj2[key]

    const bothFalsy = !value1 && !value2

    if (!bothFalsy && value1 !== value2) {
      isEqual = false
      if (debug) {
        console.log(
          `Property: ${key}\n`,
          `  Obj1: ${JSON.stringify(value1)} (${typeof value1})\n`,
          `  Obj2: ${JSON.stringify(value2)} (${typeof value2})`
        )
      }
    }
  })

  if (debug) {
    if (isEqual) {
      console.log('No differences found')
    }
    console.groupEnd()
  }

  return isEqual
}

export const useCustomIsDirty = (
  currentValues: any,
  watch: UseFormWatch<any>
) => {
  const formValues = watch()
  const isDirty = !customIsEqual(formValues, currentValues, false)

  return isDirty
}
