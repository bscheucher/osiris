'use client'

import {
  AppRouterContext,
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { use, useEffect } from 'react'

export const useInterceptAppRouter = <TMethod extends keyof AppRouterInstance>(
  method: TMethod,
  interceptFn: (
    original: AppRouterInstance[TMethod],
    ...args: Parameters<AppRouterInstance[TMethod]>
  ) => void
) => {
  const appRouter = use(AppRouterContext)

  useEffect(() => {
    if (!appRouter)
      throw new Error(
        'useInterceptAppRouter must be used within an App Router context'
      )
    const originalMethod = appRouter[method]

    appRouter[method] = ((...args: Parameters<AppRouterInstance[TMethod]>) => {
      interceptFn(originalMethod, ...args)
    }) as AppRouterInstance[TMethod]

    return () => {
      appRouter[method] = originalMethod
    }
  }, [appRouter, method, interceptFn])
}
