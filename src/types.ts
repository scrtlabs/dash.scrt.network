export enum TokenNames {
  scrt = "SCRT",
  atom = "ATOM",
  lunc = "LUNC",
  ustc = "USTC",
  osmo = "OSMO",
  dvpn = "DVPN",
  juno = "JUNO",
  huahua = "HUAHUA",
  akt = "AKT",
  evmos = "EVMOS",
  stars = "STARS",
  gravity = "GRAV",
  luna = "LUNA",
}

export interface TokenOptions {
  name: TokenNames;
  image: string;
}

type ValueOf<T> = T[keyof T];

export type mergeStateType = (
  data: keyof TokenOptions | Record<keyof TokenOptions, ValueOf<TokenOptions>>,
  value?: any
) => void;

export type TokensMarketData = {
  /** marketcap of token from coingecko */
  market_cap: number;
  /** 24H price change from coingecko*/
  price_change_percentage_24h: number;
};
export type Token = {
  /** display name of the token */
  name: string;
  /** secret contract address of the token */
  address: string;
  /** secret contract code hash of the token */
  code_hash: string;
  /** logo of the token */
  image: string;
  /** decimals of the token */
  decimals: number;
  /** coingeck id to get usd price */
  coingecko_id: string;
  /** how to deposit this token into Secret Network */
  deposits: Deposit[];
  /** how to withdraw this token out of Secret Network */
  withdrawals: Withdraw[];
};

export type Deposit = {
  /** display name of the source chain */
  source_chain_name: string;
  /** denom on the other chain */
  from_denom: string;
};

export type Withdraw = {
  /** display name of the target chain */
  target_chain_name: string;
  /** denom on Secret Network */
  from_denom: string;
};

export type Chain = {
  /** display name of the chain */
  chain_name: string;
  /** channel_id on the chain */
  deposit_channel_id: string;
  /** gas limit for ibc transfer from the chain to Secret Network */
  deposit_gas: number;
  /** channel_id on Secret Network */
  withdraw_channel_id: string;
  /** gas limit for ibc transfer from Secret Network to the chain */
  withdraw_gas: number;
  /** bech32 prefix of addresses on the chain */
  bech32_prefix: string;
  /** logo of the chain */
  chain_image: string;
  /** chain-id of the chain */
  chain_id: string;
  /** lcd url of the chain */
  lcd: string;
  /** rpc url of the chain */
  rpc: string;
  /** explorer link for accounts */
  explorer_account: string;
  /** explorer link for txs */
  explorer_tx?: string;
};
