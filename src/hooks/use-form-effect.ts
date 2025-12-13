import { useCallback, useEffect, useRef, useState } from 'react'
import { UseFormWatch, UseFormSetValue, FieldValues } from 'react-hook-form'

export type FieldOverrides = Record<string, unknown>

export function useFormEffectOverrides() {
  const [overrides, setOverrides] = useState<Record<string, FieldOverrides>>({})

  const setOverride = useCallback((field: string, props: FieldOverrides) => {
    setOverrides((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...props,
      },
    }))
  }, [])

  const getOverride = useCallback(
    (field: string): FieldOverrides => {
      return overrides[field] || {}
    },
    [overrides]
  )

  return [getOverride, setOverride] as const
}

type EffectCallback<T extends FieldValues, K extends keyof T> = (
  value: T[K]
) => void

type DependencyMap<T extends FieldValues> = {
  [K in keyof T]?: EffectCallback<T, K>
}

interface UseFormEffectOptions {
  runOnMount?: boolean
}

export function useFormEffect<T extends FieldValues>(
  dependencies: DependencyMap<T>,
  watch: UseFormWatch<T>,
  setValue: UseFormSetValue<T>,
  options: UseFormEffectOptions = { runOnMount: true }
) {
  const initializedRef = useRef(false)

  useEffect(() => {
    if (options.runOnMount && !initializedRef.current) {
      // Get current form values
      const currentValues = watch()

      // Run each dependency callback with current values
      Object.entries(dependencies).forEach(([field, callback]) => {
        const fieldKey = field as keyof T
        if (callback && currentValues[fieldKey] !== undefined) {
          callback(currentValues[fieldKey])
        }
      })

      initializedRef.current = true
    }

    // Create an array of cleanup functions
    const subscriptions = Object.entries(dependencies).map(
      ([field, callback]) => {
        return watch((value, { name }) => {
          // Only run the callback if the changed field matches our dependency
          if (callback && name === field) {
            const fieldKey = field
            const fieldValue = value[fieldKey]
            if (fieldValue !== undefined) {
              callback(fieldValue as T[keyof T])
            }
          }
        })
      }
    )

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach((subscription) => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe()
        }
      })
    }
  }, [watch, setValue, dependencies, options.runOnMount])
}

// Optional: Type-safe wrapper for setValue to ensure correct field names
// export function createSetFieldValue<T extends FieldValues>(
//   setValue: UseFormSetValue<T>,
// ) {
//   return <K extends keyof T>(field: K, value: T[K]) => {
//     setValue(field, value, {
//       shouldValidate: true,
//       shouldDirty: true,
//     })
//   }
// }
