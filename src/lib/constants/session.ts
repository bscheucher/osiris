export const SIGNIN_SUB_URL = '/login'
export const SESSION_TIMEOUT = 60 * 60 * 24 * 25 // 25 days
export const TOKEN_REFRESH_BUFFER_SECONDS = 60 * 60
// export const SESSION_SECURE = true
export const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
export const SESSION_COOKIE = SESSION_SECURE
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'
export const USER_COOKIE = SESSION_SECURE
  ? '__Secure-next-auth.user'
  : 'next-auth.user'
