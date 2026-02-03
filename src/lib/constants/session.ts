export const SIGNIN_SUB_URL = '/login'
export const SESSION_TIMEOUT = 60 * 60 * 24 * 25 // 25 days
export const TOKEN_REFRESH_BUFFER_SECONDS = 60 * 60 // 1 hour buffer before refresh

// Determine if we're in a secure context
const isSecure =
  typeof window !== 'undefined'
    ? window.location.protocol === 'https:'
    : process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false

export const SESSION_SECURE = isSecure

// Cookie name for user data (MSAL handles auth tokens in browser storage)
export const USER_COOKIE = isSecure ? '__Secure-user' : 'user'
