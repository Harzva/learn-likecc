// Secure storage types stub
export interface SecureStorage {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  read(key: string): Promise<string | undefined>
  update(key: string, value: string): Promise<void>
}
