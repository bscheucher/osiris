import { Configuration, LogLevel, BrowserCacheLocation } from '@azure/msal-browser'

// MSAL configuration for Azure AD authentication
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_SSO_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_SSO_TENANT_ID}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    postLogoutRedirectUri:
      typeof window !== 'undefined' ? `${window.location.origin}/login` : '',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            // console.info(message)
            return
          case LogLevel.Verbose:
            // console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
}

// Scopes for the access token
export const loginRequest = {
  scopes: [
    `api://${process.env.NEXT_PUBLIC_SSO_CLIENT_ID}/${process.env.NEXT_PUBLIC_SSO_CUSTOM_SCOPE}`,
    'openid',
    'profile',
    'email',
    'User.Read',
    'offline_access',
  ],
}

// Scopes for silent token acquisition
export const tokenRequest = {
  scopes: [
    `api://${process.env.NEXT_PUBLIC_SSO_CLIENT_ID}/${process.env.NEXT_PUBLIC_SSO_CUSTOM_SCOPE}`,
  ],
}

// Microsoft Graph API scopes (if needed)
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}
