export interface ParsedConnectUrl {
  serverUrl: string
  authToken: string
}

export function parseConnectUrl(_url: string): ParsedConnectUrl | null { return null }
