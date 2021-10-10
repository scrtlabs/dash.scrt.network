interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_CHAIN_ID: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_LCD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
