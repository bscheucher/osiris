import { useEffect, DependencyList } from 'react'

function useAsyncEffect<T = unknown>(
  effect: (isMounted: () => boolean) => Promise<T> | T,
  destroy?: ((result: T) => void) | DependencyList,
  deps?: DependencyList
): void {
  const hasDestroy = typeof destroy === 'function'

  useEffect(
    () => {
      let mounted = true
      let result: T

      const maybePromise = effect(() => mounted)

      Promise.resolve(maybePromise).then((value) => {
        if (mounted) {
          result = value
        }
      })

      return () => {
        mounted = false
        if (hasDestroy) {
          ;(destroy as (result: T) => void)(result)
        }
      }
    },
    hasDestroy ? deps : (destroy as DependencyList)
  )
}

export default useAsyncEffect
