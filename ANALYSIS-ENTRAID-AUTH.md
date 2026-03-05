# EntraID Authentication, Session Management & User Data Analysis

## Architecture Overview

This is a **Next.js 15** application using **NextAuth.js v4** with the **Azure AD Provider** for EntraID authentication. The system uses JWT-based sessions stored in chunked HTTP-only cookies, with automatic token refresh via Next.js middleware.

---

## 1. EntraID Login Flow

### Configuration (`src/app/api/auth/[...nextauth]/auth-options.ts`)

- **Provider:** `AzureADProvider` from `next-auth/providers/azure-ad`
- **Session strategy:** JWT (no database sessions)
- **Custom login page:** `/login`

**Environment variables required:**

| Variable | Purpose |
|---|---|
| `SSO_CLIENT_ID` | Azure AD application (client) ID |
| `SSO_TENANT_ID` | Azure AD tenant ID |
| `SSO_CLIENT_SECRET` | Azure AD client secret |
| `SSO_CUSTOM_SCOPE` | Custom API scope name |
| `SSO_AUTO_LOGIN` | If set, skips `prompt: 'login'` (allows SSO without re-auth) |
| `NEXTAUTH_SECRET` | Secret for JWT signing/encryption |
| `NEXTAUTH_URL` | Application base URL (also determines Secure cookie flag) |

**OAuth2 scopes requested:**
```
api://<CLIENT_ID>/<CUSTOM_SCOPE> openid profile email User.Read offline_access
```

### Login Step-by-Step

1. User visits `/login` and clicks "Mit Azure SSO einloggen" (`src/app/login/sign-in-form.tsx`)
2. `signIn('azure-ad', { callbackUrl: '/dashboard' })` redirects to Azure AD
3. Azure AD authenticates the user (with `prompt: 'login'` unless `SSO_AUTO_LOGIN` is set)
4. Azure redirects back to `/api/auth/callback/azure-ad` (NextAuth catch-all route)
5. **`signIn` callback** (`auth-options.ts:32-44`): Extracts `access_token` from the account, calls `getUserData(access_token)` to validate the user exists in the backend (`/benutzer/get`) and stores user data in a cookie
6. **`jwt` callback** (`auth-options.ts:54-62`): Stores `access_token`, `refresh_token`, and `expires_at` in the JWT
7. **`session` callback** (`auth-options.ts:64-84`): Constructs the session object exposing tokens and expiry to the client
8. User is redirected to `/dashboard`

### Logout Flow

**Client-side** (`src/app/(authenticated)/navigation.tsx:92-99`):
- Calls `signOut()` with a `callbackUrl` pointing to the Azure AD v2.0 logout endpoint
- `post_logout_redirect_uri` sends the user back to `/login`

**Server-side** (`src/lib/utils/auth-utils.ts:8-25`):
- `executeUserSessionLogout()` calls `/benutzer/logout` on the backend gateway
- Deletes all cookies starting with the `USER_COOKIE` prefix

---

## 2. Session Management

### Session Strategy

JWT-based — no database session store. The JWT is encoded and stored as an HTTP cookie.

### Session Constants (`src/lib/constants/session.ts`)

| Constant | Value | Purpose |
|---|---|---|
| `SESSION_TIMEOUT` | 25 days (2,160,000s) | JWT `maxAge` / cookie `maxAge` |
| `TOKEN_REFRESH_BUFFER_SECONDS` | 1 hour (3,600s) | Refresh token this long before expiry |
| `SESSION_SECURE` | `NEXTAUTH_URL?.startsWith('https://')` | Controls Secure flag & cookie name prefix |
| `SESSION_COOKIE` | `__Secure-next-auth.session-token` or `next-auth.session-token` | Session cookie name |
| `USER_COOKIE` | `__Secure-next-auth.user` or `next-auth.user` | User data cookie name |

### Cookie Configuration

Set in `src/middleware.ts:121-130`:

```
httpOnly: true
maxAge:   SESSION_TIMEOUT (25 days)
secure:   SESSION_SECURE (true if HTTPS)
sameSite: 'lax'
path:     '/'
```

### Cookie Chunking (`src/lib/utils/cookie.ts`)

JWTs can exceed the 4KB cookie size limit. The `SessionStore` class splits tokens into multiple cookies:
- Chunk size: 3,936 bytes (4,096 - 160 overhead)
- Chunks named `<cookie-name>.0`, `<cookie-name>.1`, etc.
- Reassembled on read by sorting and joining chunks

### Token Refresh (`src/middleware.ts`)

The middleware runs on every authenticated route (matcher: `/((?!api|_next/static|_next/image|favicon.ico|login).*)`):

1. `getToken({ req })` extracts and verifies the JWT from the request cookie
2. If no token → redirect to `/login` (clears session cookies)
3. `shouldUpdateToken(token)` checks if current time >= `expires_at - 1 hour`
4. If refresh needed → `refreshAccessToken(token)`:
   - POSTs to `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token` with `grant_type=refresh_token`
   - Uses `isRefreshing` flag to debounce concurrent refresh attempts
   - Returns new `access_token`, `expires_at`, `refresh_token`
5. New JWT is encoded via `next-auth/jwt/encode` and stored in updated chunked cookies
6. `updateUserSession()` also re-fetches user data from `/benutzer/get` on refresh
7. If refresh fails → clears cookies and redirects to `/login`

### Session Access Patterns

| Context | How to access |
|---|---|
| Server components / API routes | `serverSession()` → `getServerSession(authOptions)` |
| Client components | `useSession()` from `next-auth/react` (via `SessionProvider`) |
| Middleware | `getToken({ req })` from `next-auth/jwt` |

The `SessionProvider` is configured with `refetchOnWindowFocus={false}` (`src/providers/next-auth.tsx`).

---

## 3. User Data Handling

### User Model (`src/lib/interfaces/user.ts`)

```typescript
interface User {
  firstName: string
  lastName: string
  azureId: string
  roles: ROLE[]
}
```

### User Data Flow

```
Azure AD login
     │
     ▼
signIn callback ──► getUserData(access_token) ──► GET /benutzer/get ──► backend returns User
     │                                                                        │
     ▼                                                                        ▼
JWT stored in cookie                                            setUser(user) → stored in 'user' cookie
```

**Two parallel data paths:**

1. **Auth tokens** (access/refresh) → stored in the **session JWT cookie** (encrypted, httpOnly)
2. **User profile data** (name, roles, azureId) → stored in a separate **'user' cookie** (httpOnly, JSON-serialized)

### Server-Side User Access (`src/lib/utils/api-utils.ts`)

- `getUser()` reads the `'user'` cookie and parses it as `User`
- `setUser(user)` writes the `User` object to the `'user'` cookie
- `getRoles()` convenience function returns `user.roles`
- `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE` env var can inject additional roles (merged with user roles, deduplicated)

### Client-Side User Access — Zustand Store (`src/stores/user-store.ts`)

```typescript
interface UserStore {
  user: { firstName, lastName, fullName } | null
  roles: ROLE[] | null
  fetchUser()              // loads from cookie via getUser()
  hasSomeRole(roles)       // checks if user has ANY of the given roles
  hasEveryRole(roles)      // checks if user has ALL of the given roles
}
```

- `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE` can **completely replace** roles in the Zustand store (different behavior from server-side where it merges)

### Role-Based Access Control (`src/lib/constants/role-constants.ts`)

65 granular roles defined as a `ROLE` enum, covering:
- Dashboard widgets (CFO, PK, seminars, personal data)
- Employee management (create, edit, read, onboarding, contract changes)
- Participant management (create, edit, read, onboarding, exit)
- Absence/attendance management
- AI chatbot, reports, seminars

### API Gateway — Bearer Token Injection (`src/app/api/gateway/[...route]/route.ts`)

All backend API calls are proxied through `/api/gateway/[...route]`:
1. `serverSession()` retrieves the session
2. If no session → throws `Unauthorized`
3. Sets `Authorization: Bearer <access_token>` header
4. Forwards request to `NEXT_PUBLIC_GATEWAY_URL`

This means the **backend never receives user identity directly from the frontend** — it relies on the Azure AD access token to identify the user.

---

## 4. Identified Observations & Potential Concerns

### Security

1. **Silent error swallowing**: Multiple `catch` blocks with commented-out `console.error` (`middleware.ts:88`, `auth-utils.ts:22,43`). Failed token refreshes, logout failures, and user data fetches silently fail, making debugging difficult.

2. **`showErrorMessage` in server context**: `auth-options.ts:39` calls `showErrorMessage(e)` (a toast utility) inside the `signIn` callback, which runs server-side. This likely has no effect and the error is lost.

3. **User cookie not encrypted**: The `'user'` cookie containing `firstName`, `lastName`, `azureId`, and `roles` is stored as plain JSON (`httpOnly: true` but not encrypted). While httpOnly prevents JS access, the data is visible in browser dev tools and in transit if HTTPS is misconfigured.

4. **Inconsistent role override behavior**:
   - Server-side (`api-utils.ts:39-41`): `DEBUG_ROLE_OVERRIDE` roles are **merged** with real roles
   - Client-side (`user-store.ts:52-56`): `DEBUG_ROLE_OVERRIDE` **replaces** real roles entirely
   - This inconsistency could cause confusing behavior during development

5. **Global mutable state in middleware**: `isRefreshing` (`middleware.ts:17`) is a module-level `let` variable used to debounce token refresh. In serverless/edge environments, this state is not shared across instances and may not reliably prevent concurrent refreshes.

6. **`credentials: 'include'` on server-side fetch**: `middleware.ts:72` includes `credentials: 'include'` on the token refresh fetch to Microsoft's endpoint. This is unnecessary for server-side requests and has no effect in Node.js.

### Session Management

7. **25-day session timeout is very long**: The `SESSION_TIMEOUT` of 25 days means a user's session persists for nearly a month. Combined with automatic token refresh, a user who visits the app at least once per hour would effectively never be logged out. Consider whether this aligns with security requirements.

8. **No server-side session revocation**: Since sessions are pure JWT (no database), there is no mechanism to revoke a specific user's session. If an employee's access should be immediately revoked, the only option is to disable their Azure AD account and wait for token expiry.

9. **Token refresh returns original token on failure**: `refreshAccessToken()` (`middleware.ts:95`) returns the original (potentially expired) token if refresh fails, rather than `null`. The caller does handle this by catching exceptions, but a non-exception failure path could leave an expired token in place.

### User Data

10. **User data fetched but not stored on refresh**: `updateUserSession()` in middleware (`middleware.ts:19-34`) fetches user data from `/benutzer/get` but only returns the response — it doesn't call `setUser()` to update the user cookie. The user cookie only gets updated during initial sign-in (`getUserData` in `auth-utils.ts:27-46` calls `setUser`). If user roles change, they won't be reflected until re-login.

11. **No user data validation**: The `User` data from `/benutzer/get` is trusted without schema validation. If the backend returns unexpected data, it's stored directly in cookies and the Zustand store.
