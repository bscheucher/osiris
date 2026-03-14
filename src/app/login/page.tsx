import Image from 'next/image'
import { redirect } from 'next/navigation'

import { SignInForm } from './sign-in-form'
import { serverSession } from '../api/auth/[...nextauth]/auth-options'
import AspireLogo from '@/../public/aspire-logo.svg'
import MicrosoftLogo from '@/../public/microsoft.webp'

export default async function Page() {
  const session = await serverSession()

  if (session) {
    redirect('/dashboard')
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
