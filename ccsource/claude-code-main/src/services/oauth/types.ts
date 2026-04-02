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
  tokenAccount?: {
    uuid: string
    emailAddress: string
    organizationUuid?: string
  }
  scopes?: string[]
  subscriptionType?: SubscriptionType
  rateLimitTier?: RateLimitTier
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
  referral_code_details?: {
    code: string
    url: string
  }
  referrer_reward?: {
    type: string
    amount: number
  }
  remaining_passes?: number
}

export interface ReferralRedemptionsResponse {
  redemptions: Array<{
    id: string
    redeemedAt: number
  }>
  limit?: number
}

export interface ReferrerRewardInfo {
  rewardId: string
  rewardType: string
  status: string
  currency?: string
  amount_minor_units?: number
}

// Org validation types
export interface OrgValidationResult {
  valid: boolean
  message?: string
}

// Subscription and billing types
export type SubscriptionType = 'free' | 'pro' | 'team' | 'enterprise' | 'max'

export type BillingType = 'individual' | 'team' | 'enterprise' | 'stripe_subscription' | 'stripe_subscription_contracted' | 'apple_subscription' | 'google_play_subscription'

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
    email?: string
    display_name?: string
    created_at?: string
    has_extra_usage_enabled?: boolean
  }
  organization?: {
    uuid: string
    name?: string
    organization_type?: string
    rate_limit_tier?: RateLimitTier
    has_extra_usage_enabled?: boolean
    billing_type?: BillingType
    subscription_created_at?: string
  }
}

// Additional OAuth types
export interface OAuthTokenExchangeResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  scope?: string
  account?: {
    uuid: string
    emailAddress: string
    organizationUuid?: string
    email?: string
    display_name?: string
    created_at?: string
  }
  organization?: {
    uuid: string
    name?: string
    organization_type?: string
    rate_limit_tier?: RateLimitTier
    has_extra_usage_enabled?: boolean
    billing_type?: BillingType
    subscription_created_at?: string
  }
}

export type RateLimitTier = 'free' | 'standard' | 'premium' | 'enterprise'

export interface UserRolesResponse {
  roles: string[]
  permissions: string[]
  organization_role?: string
  workspace_role?: string
  organization_name?: string
}