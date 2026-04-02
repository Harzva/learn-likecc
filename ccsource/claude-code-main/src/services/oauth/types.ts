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
  profile?: OAuthProfileResponse
  tokenAccount?: string
  scopes?: string[]
}

// Alias for backward compatibility
export type OAuthTokens = OAuthToken

export interface OAuthState {
  status: 'pending' | 'authenticated' | 'expired' | 'error'
  token?: OAuthToken
  error?: string
}

// Referral types
export interface ReferralCampaign {
  id: string
  name: string
  description?: string
}

export interface ReferralEligibilityResponse {
  eligible: boolean
  reason?: string
}

export interface ReferralRedemptionsResponse {
  redemptions: Array<{
    id: string
    redeemedAt: number
  }>
}

export interface ReferrerRewardInfo {
  rewardId: string
  rewardType: string
  status: string
}

// Org validation types
export interface OrgValidationResult {
  valid: boolean
  message?: string
}

// Subscription and billing types
export type SubscriptionType = 'free' | 'pro' | 'team' | 'enterprise'

export type BillingType = 'individual' | 'team' | 'enterprise'

export interface OAuthProfileResponse {
  id: string
  email: string
  name?: string
  subscriptionType?: SubscriptionType
  billingType?: BillingType
  account?: {
    uuid: string
    emailAddress: string
    organizationUuid?: string
  }
  organization?: {
    uuid: string
    name?: string
  }
}

// Additional OAuth types
export interface OAuthTokenExchangeResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
}

export type RateLimitTier = 'free' | 'standard' | 'premium' | 'enterprise'

export interface UserRolesResponse {
  roles: string[]
  permissions: string[]
}