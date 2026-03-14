import { type User } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: User
    token_expiry?: {
      access_token: number
    }
    token_value: {
      access_token: string
      refresh_token: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token: string
    expires_at: number
    refresh_token: string
  }
}
