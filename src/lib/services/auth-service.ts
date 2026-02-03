import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  AccountInfo,
  IPublicClientApplication,
} from '@azure/msal-browser'

import { msalConfig, tokenRequest } from '@/lib/config/msal-config'

/**
 * Authentication service for managing MSAL tokens
 * Can be used in both React and non-React contexts
 */
class AuthService {
  private msalInstance: IPublicClientApplication | null = null
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize the MSAL instance (only in browser environment)
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = (async () => {
      if (!this.msalInstance) {
        this.msalInstance = new PublicClientApplication(msalConfig)
        await this.msalInstance.initialize()
        await this.msalInstance.handleRedirectPromise()
      }
    })()

    return this.initPromise
  }

  /**
   * Set the MSAL instance (used by MsalProvider)
   */
  setMsalInstance(instance: IPublicClientApplication): void {
    this.msalInstance = instance
  }

  /**
   * Get the current MSAL instance
   */
  getMsalInstance(): IPublicClientApplication | null {
    return this.msalInstance
  }

  /**
   * Get the current active account
   */
  getActiveAccount(): AccountInfo | null {
    if (!this.msalInstance) {
      return null
    }
    return this.msalInstance.getActiveAccount()
  }

  /**
   * Get access token for API calls
   * Uses cached token if valid, otherwise acquires a new one
   */
  async getAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null
    }

    // Return cached token if it's still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry) {
      const now = Date.now()
      const bufferMs = 5 * 60 * 1000 // 5 minutes buffer
      if (now < this.tokenExpiry - bufferMs) {
        return this.accessToken
      }
    }

    await this.initialize()

    if (!this.msalInstance) {
      return null
    }

    const account = this.msalInstance.getActiveAccount()
    if (!account) {
      // Try to get any account
      const accounts = this.msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0])
      } else {
        return null
      }
    }

    try {
      const activeAccount = this.msalInstance.getActiveAccount()
      if (!activeAccount) {
        return null
      }

      const response = await this.msalInstance.acquireTokenSilent({
        ...tokenRequest,
        account: activeAccount,
      })

      this.accessToken = response.accessToken
      this.tokenExpiry = response.expiresOn?.getTime() || null

      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token acquisition requires user interaction
        // This will trigger a redirect, so we can't return a token
        try {
          await this.msalInstance.acquireTokenRedirect(tokenRequest)
        } catch (redirectError) {
          console.error('Redirect token acquisition failed:', redirectError)
        }
        return null
      }
      console.error('Token acquisition failed:', error)
      return null
    }
  }

  /**
   * Set the access token manually (used when token is acquired elsewhere)
   */
  setAccessToken(token: string, expiresOn?: Date): void {
    this.accessToken = token
    this.tokenExpiry = expiresOn?.getTime() || null
  }

  /**
   * Clear the cached token
   */
  clearToken(): void {
    this.accessToken = null
    this.tokenExpiry = null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.msalInstance) {
      return false
    }
    const accounts = this.msalInstance.getAllAccounts()
    return accounts.length > 0
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    this.clearToken()

    if (this.msalInstance) {
      await this.msalInstance.logoutRedirect({
        postLogoutRedirectUri: '/login',
      })
    }
  }
}

// Export a singleton instance
export const authService = new AuthService()
