import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'

export const renderWithIntl = (children, locale = 'de') => {
  const messages = require(`./src/messages/${locale}.json`)
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  redirect: jest.fn(),
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve({ user: { name: 'Test User' } })),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: 'Test User' } },
    status: 'authenticated',
  })),
  getSession: jest.fn(() => Promise.resolve({ user: { name: 'Test User' } })),
}))
