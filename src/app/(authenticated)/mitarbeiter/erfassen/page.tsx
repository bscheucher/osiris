'use client'

import { useTranslations } from 'next-intl'

import MitarbeiterAnlegenForm from './mitarbeiter-anlegen-form'

export default function Page() {
  const t = useTranslations('mitarbeiter.erfassen.anlegen')

  return (
    <div className="flex flex-1 flex-col py-12 sm:px-6 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[560px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
            {t('mitarbeiterAnlegen')}
          </h2>
          <MitarbeiterAnlegenForm />
        </div>
      </div>
    </div>
  )
}
