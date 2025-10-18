/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string

  readonly VITE_ALGOD_TOKEN: string
  readonly VITE_ALGOD_SERVER: string
  readonly VITE_ALGOD_PORT: string
  readonly VITE_ALGOD_NETWORK: string

  readonly VITE_INDEXER_TOKEN: string
  readonly VITE_INDEXER_SERVER: string
  readonly VITE_INDEXER_PORT: string

  readonly VITE_KMD_TOKEN: string
  readonly VITE_KMD_SERVER: string
  readonly VITE_KMD_PORT: string
  readonly VITE_KMD_PASSWORD: string
  readonly VITE_KMD_WALLET: string
  readonly VITE_API_URL?: string
  readonly VITE_TREASURY_ADDRESS?: string
  readonly VITE_HOT_WALLET?: string
  readonly VITE_HOT_WALLET_ADDRESS?: string
  readonly VITE_OPERATIONAL_WALLET?: string
  readonly VITE_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
