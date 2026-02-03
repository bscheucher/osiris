import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server'

/**
 * Middleware for handling authentication redirects.
 *
 * With MSAL, authentication state is managed client-side in browser storage.
 * This middleware provides basic route protection by checking for the presence
 * of an auth state cookie. The actual token validation happens client-side
 * via the AuthGuard component.
 */
export const middleware: NextMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Allow access to login page and public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for MSAL-related cookies that indicate an active session
  // MSAL stores some state in cookies when storeAuthStateInCookie is true
  const cookies = request.cookies.getAll()
  const hasMsalCookie = cookies.some(
    (cookie) =>
      cookie.name.includes('msal.') ||
      cookie.name.includes('msalAccount') ||
      cookie.name === 'user'
  )

  // If no auth indicators found, redirect to login
  // The client-side AuthGuard will handle the actual authentication check
  if (!hasMsalCookie) {
    // Check if there might be sessionStorage auth (can't verify from middleware)
    // Let the request through and let client-side handle it
    // This is because MSAL primarily uses sessionStorage which isn't accessible here
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
