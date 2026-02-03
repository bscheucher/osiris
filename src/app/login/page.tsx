'use client'

import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { SignInForm } from './sign-in-form'
import AspireLogo from '@/../public/aspire-logo.svg'
import MicrosoftLogo from '@/../public/microsoft.webp'

export default function Page() {
  const isAuthenticated = useIsAuthenticated()
  const { inProgress } = useMsal()
  const router = useRouter()

  useEffect(() => {
    // Wait until MSAL has finished any interaction before redirecting
    if (isAuthenticated && inProgress === InteractionStatus.None) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, inProgress, router])

  // Show loading state while MSAL is processing
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If authenticated, don't render the login form (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <div className="h-40">
          <Image
            src={AspireLogo}
            alt="logo"
            width="320"
            height="150"
            priority
          />
        </div>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="flex flex-col items-center rounded-lg bg-white px-4 py-12 shadow sm:px-12">
          <div className="mb-8 flex w-32">
            <Image
              src={MicrosoftLogo}
              alt="logo"
              width="1280"
              height="273"
              priority
            />
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
