'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import ButtonTw from '@/components/atoms/button-tw'

export default function NotFound() {
  const t = useTranslations('errorPage')

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <div className="h-40 w-60">
          <Image
            src="/ibis-acam-logo.svg"
            alt="logo"
            width="240"
            height="160"
            priority
          />
        </div>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="flex flex-col justify-center rounded-lg bg-white px-6 py-12 shadow sm:px-12">
          <h2 className="mb-8 text-center text-3xl font-semibold text-gray-900">
            {t('pageNotFound')}
          </h2>
          <ButtonTw href="/dashboard">{t('backToDashboard')}</ButtonTw>
        </div>
      </div>
    </div>
  )
}
