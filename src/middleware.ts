import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server'
import { encode, getToken, type JWT } from 'next-auth/jwt'

import {
  TOKEN_REFRESH_BUFFER_SECONDS,
  SESSION_COOKIE,
  SESSION_TIMEOUT,
  SESSION_SECURE,
  SIGNIN_SUB_URL,
} from './lib/constants/session'
import { SessionStore } from './lib/utils/cookie'

let isRefreshing = false

export async function updateUserSession(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_GATEWAY_URL}/benutzer/get`,
    {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )

  const responseData = await response.json()
  if (responseData?.error) {
    throw new Error(`${responseData.error} for URL: 'benutzer/get'`)
  }

  return responseData
}

export function clearSessionCookies(
  request: NextRequest,
  response: NextResponse
) {
  const existingCookies = request.cookies.getAll()
  existingCookies.forEach((cookie) => {
    if (cookie.name.startsWith(SESSION_COOKIE)) {
      response.cookies.delete(cookie.name)
    }
  })
}

export function shouldUpdateToken(token: JWT): boolean {
  const timeInSeconds = Math.floor(Date.now() / 1000)
  return timeInSeconds >= token?.expires_at - TOKEN_REFRESH_BUFFER_SECONDS
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (isRefreshing) {
    return token
  }

  const timeInSeconds = Math.floor(Date.now() / 1000)
  isRefreshing = true

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.SSO_TENANT_ID!}/oauth2/v2.0/token`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.SSO_CLIENT_ID!,
          client_secret: process.env.SSO_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token?.refresh_token,
        }),
        credentials: 'include',
        method: 'POST',
      }
    )

    const newTokens = await response.json()

    if (!response.ok) {
      throw new Error(`Token refresh failed with status: ${response.status}`)
    }

    return {
      access_token: newTokens?.access_token ?? token?.access_token,
      expires_at: newTokens?.expires_in + timeInSeconds,
      refresh_token: newTokens?.refresh_token ?? token?.refresh_token,
    }
  } catch (_) {
    // TODO: Handle error in central error handling
    // console.error(e)
  } finally {
    isRefreshing = false
  }

  return token
}

export function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse
): NextResponse<unknown> {
  /*
   * BASIC IDEA:
   *
   * 1. Set request cookies for the incoming getServerSession to read new session
   * 2. Updated request cookie can only be passed to server if it's passed down here after setting its updates
   * 3. Set response cookies to send back to browser
   */

  if (sessionToken) {
    // Set the session token in the request cookies for a valid session
    request.cookies.set(SESSION_COOKIE, sessionToken)

    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const sessionStore = new SessionStore({
      name: SESSION_COOKIE,
      options: {
        httpOnly: true,
        maxAge: SESSION_TIMEOUT,
        secure: SESSION_SECURE,
        sameSite: 'lax',
        path: '/',
      },
    })

    const cookieChunks = sessionStore.chunk(sessionToken)

    // Clear any existing chunked cookies that might be stale
    // This prevents accumulation of old chunked cookies
    clearSessionCookies(request, response)

    // Set all cookie chunks in the response
    cookieChunks.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
  } else {
    // Clear any existing chunked cookies
    clearSessionCookies(request, response)

    return NextResponse.redirect(new URL(SIGNIN_SUB_URL, request.url))
  }

  return response
}

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const token = await getToken({ req: request })

  const response = NextResponse.next()

  if (!token) {
    return updateCookie(null, request, response)
  }

  if (shouldUpdateToken(token)) {
    try {
      const refreshedTokens = await refreshAccessToken(token)
      const newSessionToken = await encode({
        secret: process.env.NEXTAUTH_SECRET!,
        token: refreshedTokens,
        maxAge: SESSION_TIMEOUT,
      })
      await updateUserSession(refreshedTokens.access_token)
      return updateCookie(newSessionToken, request, response)
    } catch (_) {
      // console.log('Error refreshing token: ', error)

      // Return empty cookie to force re-login
      return updateCookie(null, request, response)
    }
  }
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
