import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * A custom hook that returns a function to update URL search parameters.
 * It retains existing parameters and allows updating or adding new ones.
 *
 * @returns A function that updates URL search parameters
 */
export const useUpdateUrlSearchParams = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /**
   * Updates the URL search parameters
   *
   * @param updates - An object containing the parameters to update or add
   * @param options - Optional settings for the update operation
   */
  const updateSearchParams = <T extends Record<string, any>>(
    updates: T,
    options: {
      replace?: boolean
      scroll?: boolean
      clearEmpty?: boolean
    } = {}
  ) => {
    const { replace = false, scroll = true, clearEmpty = true } = options

    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        (clearEmpty && (value === '' || value === null))
      ) {
        newSearchParams.delete(key)
      } else if (Array.isArray(value)) {
        newSearchParams.delete(key)
        if (value.length) {
          newSearchParams.set(key, value.map(String).join(','))
        }
      } else {
        newSearchParams.set(key, String(value))
      }
    })

    const search = newSearchParams.toString()
    const query = search ? `?${search}` : ''

    if (replace) {
      router.replace(`${pathname}${query}`, { scroll })
    } else {
      router.push(`${pathname}${query}`, { scroll })
    }
  }

  return updateSearchParams
}

// Usage example:
// const MyComponent = () => {
//   const updateSearchParams = useUpdateUrlSearchParams()
//
//   const handleUpdateParams = (data: TeilnehmerFormInputs) => {
//     updateSearchParams(data)
//   }
//
//   // ... rest of the component
// }
