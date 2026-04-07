/**
 * Install GitHub app types stub - not implemented
 */

export interface GitHubAppConfig {
  appId: string
  clientId: string
  clientSecret?: string
  webhookSecret?: string
}

export interface GitHubAppStatus {
  installed: boolean
  appId?: string
  permissions?: Record<string, string>
}

export interface CreatingStepState {
  status: 'pending' | 'creating' | 'created' | 'error'
  error?: string
}

export interface WarningsStepState {
  warnings: string[]
  acknowledged: boolean
}