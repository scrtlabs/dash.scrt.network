interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_TERRA_CHAIN_ID: string;
  readonly VITE_TERRA_LCD_URL: string;
  readonly VITE_COSMOS_CHAIN_ID: string;
  readonly VITE_COSMOS_LCD_URL: string;
  readonly VITE_OSMOSIS_CHAIN_ID: string;
  readonly VITE_OSMOSIS_LCD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
