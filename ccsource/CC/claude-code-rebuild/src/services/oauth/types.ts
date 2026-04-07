/**
 * OAuth types stub - not implemented
 */

export interface OAuthConfig {
  clientId: string
  clientSecret?: string
  redirectUri: string
  scopes: string[]
}

export interface OAuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface OAuthState {
  status: 'pending' | 'authenticated' | 'expired' | 'error'
  token?: OAuthToken
  error?: string
}