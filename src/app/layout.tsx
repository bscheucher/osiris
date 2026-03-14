import dayjs from 'dayjs'
import { Metadata } from 'next'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { MainModal } from '@/components/organisms/main-modal'
import { NavigationBlockerProvider } from '@/contexts/navigation-blocker-context'
import { ModalProvider } from '@/hooks/use-modal'
import NextAuthProvider from '@/providers/next-auth'
import '@/styles/globals.css'
import '@/styles/dashboard.css'
import '@/styles/datepicker-tw.css'

import 'dayjs/locale/de'
dayjs.locale('de')

const inter = localFont({
  src: [
    {
      path: '../fonts/Inter_18pt-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Inter_18pt-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Inter_18pt-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/Inter_18pt-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
})

const DEFAULT_LOCALE = 'de'

export const metadata: Metadata = {
  title: 'IbosNG',
  description: 'This is the IbosNG Application',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const locale = (await getLocale()) || DEFAULT_LOCALE
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={twMerge(inter.variable, 'font-inter h-full bg-gray-50')}
    >
      <body className={twMerge(inter.className, 'font-inter h-full')}>
        <NextAuthProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ModalProvider>
              <NavigationBlockerProvider>{children}</NavigationBlockerProvider>
              <MainModal />
            </ModalProvider>
          </NextIntlClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
