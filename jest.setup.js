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

// Mock MSAL
jest.mock('@azure/msal-react', () => ({
  useMsal: jest.fn(() => ({
    instance: {
      loginRedirect: jest.fn(),
      logoutRedirect: jest.fn(),
      acquireTokenSilent: jest.fn(() =>
        Promise.resolve({ accessToken: 'mock-token' })
      ),
      getActiveAccount: jest.fn(() => ({
        username: 'test@example.com',
        name: 'Test User',
      })),
      getAllAccounts: jest.fn(() => [
        { username: 'test@example.com', name: 'Test User' },
      ]),
      setActiveAccount: jest.fn(),
    },
    accounts: [{ username: 'test@example.com', name: 'Test User' }],
    inProgress: 'none',
  })),
  useIsAuthenticated: jest.fn(() => true),
  useAccount: jest.fn(() => ({
    username: 'test@example.com',
    name: 'Test User',
  })),
  useMsalAuthentication: jest.fn(() => ({
    login: jest.fn(),
    error: null,
    result: { accessToken: 'mock-token' },
  })),
  MsalProvider: ({ children }) => children,
}))

jest.mock('@azure/msal-browser', () => ({
  PublicClientApplication: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(() => Promise.resolve()),
    handleRedirectPromise: jest.fn(() => Promise.resolve(null)),
    loginRedirect: jest.fn(),
    logoutRedirect: jest.fn(),
    acquireTokenSilent: jest.fn(() =>
      Promise.resolve({ accessToken: 'mock-token' })
    ),
    getActiveAccount: jest.fn(() => ({
      username: 'test@example.com',
      name: 'Test User',
    })),
    getAllAccounts: jest.fn(() => [
      { username: 'test@example.com', name: 'Test User' },
    ]),
    setActiveAccount: jest.fn(),
    addEventCallback: jest.fn(),
  })),
  InteractionStatus: {
    None: 'none',
    Login: 'login',
    Logout: 'logout',
    AcquireToken: 'acquireToken',
    SsoSilent: 'ssoSilent',
    HandleRedirect: 'handleRedirect',
  },
  InteractionType: {
    Redirect: 'redirect',
    Popup: 'popup',
    Silent: 'silent',
  },
  InteractionRequiredAuthError: class InteractionRequiredAuthError extends Error {
    constructor(message) {
      super(message)
      this.name = 'InteractionRequiredAuthError'
    }
  },
  EventType: {
    LOGIN_SUCCESS: 'msal:loginSuccess',
    LOGIN_FAILURE: 'msal:loginFailure',
    LOGOUT_SUCCESS: 'msal:logoutSuccess',
  },
  LogLevel: {
    Error: 0,
    Warning: 1,
    Info: 2,
    Verbose: 3,
    Trace: 4,
  },
}))
