// Secure storage types stub
export interface MCPOAuthData {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  clientId?: string
  clientSecret?: string
  discoveryState?: string
  stepUpScope?: string
}

export interface MCPOAuthClientConfig {
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface SecureStorageData {
  mcpOAuth?: MCPOAuthData
  mcpOAuthClientConfig?: MCPOAuthClientConfig
  trustedDeviceToken?: string
  [key: string]: unknown
}

export interface SecureStorage {
  name: string
  read(): SecureStorageData | null
  readAsync(): Promise<SecureStorageData | null>
  update(data: SecureStorageData): { success: boolean; warning?: string }
  delete(): void
  // Legacy methods
  get?(key: string): Promise<string | undefined>
  set?(key: string, value: string): Promise<void>
}
