import { getServerSession, NextAuthOptions, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import AzureADProvider from 'next-auth/providers/azure-ad'

import { getUserData } from '@/lib/utils/auth-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

export const authOptions: NextAuthOptions = {
  debug: false,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    AzureADProvider({
      clientId: process.env.SSO_CLIENT_ID!,
      clientSecret: process.env.SSO_CLIENT_SECRET!,
      tenantId: process.env.SSO_TENANT_ID!,
      authorization: {
        params: {
          // scope: 'openid profile email User.Read offline_access',
          scope: `api://${process.env.SSO_CLIENT_ID!}/${process.env.SSO_CUSTOM_SCOPE!} openid profile email User.Read offline_access`,
          prompt: process.env.SSO_AUTO_LOGIN ? undefined : 'login',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn(params) {
      if (params.account) {
        try {
          const { access_token } = params.account
          await getUserData(access_token)
          return true
        } catch (e) {
          showErrorMessage(e)
          return false
        }
      }
      return false
    },

    async redirect({ url, baseUrl }): Promise<string> {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },

    async jwt({ token, account }): Promise<JWT> {
      if (account) {
        token.expires_at = account.expires_at!
        token.access_token = account.access_token!
        token.refresh_token = account.refresh_token!
      }

      return token
    },

    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<Session> {
      if (!token) return session

      return {
        expires: session.expires,
        user: session.user,
        token_expiry: {
          access_token: token.expires_at,
        },
        token_value: {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        },
      }
    },
  },
}

export const serverSession = async () => await getServerSession(authOptions)
