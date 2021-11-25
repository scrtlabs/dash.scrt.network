export const SECRET_LCD = "https://bridge-api-manager.azure-api.net";
export const SECRET_CHAIN_ID = "secret-4";

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
  /** how to deposit this token into Secret Network */
  deposit_from: Deposit[];
  /** how to withdraw this token out of Secret Network */
  withdraw_to: Withdraw[];
};

export type Deposit = {
  /** display name of the other chain */
  chain_name: string;
  /** denom on the other chain */
  denom: string;
};

export type Withdraw = {
  /** display name of the other chain */
  chain_name: string;
  /** denom on Secret Network */
  denom: string;
};

export const tokens: Token[] = [
  {
    name: "SCRT",
    address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    code_hash:
      "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e",
    image: "/scrt.svg",
    decimals: 6,
    deposit_from: [
      {
        chain_name: "Cosmos Hub",
        denom: "TODO", // SCRT denom on Cosmos
      },
      {
        chain_name: "Terra",
        denom: "TODO", // SCRT denom on Terra
      },
      {
        chain_name: "Osmosis",
        denom: "TODO", // SCRT denom on Osmosis
      },
    ],
    withdraw_to: [
      {
        chain_name: "Cosmos Hub",
        denom: "uscrt",
      },
      {
        chain_name: "Terra",
        denom: "uscrt",
      },
      {
        chain_name: "Osmosis",
        denom: "uscrt",
      },
    ],
  },
  {
    name: "ATOM",
    address: "secret14mzwd0ps5q277l20ly2q3aetqe3ev4m4260gf4",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/atom.jpg",
    decimals: 6,
    deposit_from: [
      {
        chain_name: "Cosmos Hub",
        denom: "uatom",
      },
    ],
    withdraw_to: [
      {
        chain_name: "Cosmos Hub",
        denom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
    ],
  },
  {
    name: "Luna",
    address: "secret1ra7avvjh9fhr7dtr3djutugwj59ptctsrakyyw",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/luna.png",
    decimals: 6,
    deposit_from: [
      {
        chain_name: "Terra",
        denom: "uluna",
      },
    ],
    withdraw_to: [
      {
        chain_name: "Terra",
        denom:
          "ibc/D70B0FBF97AEB04491E9ABF4467A7F66CD6250F4382CE5192D856114B83738D2",
      },
    ],
  },
  {
    name: "UST",
    address: "secret129h4vu66y3gry6wzwa24rw0vtqjyn8tujuwtn9",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/ust.png",
    decimals: 6,
    deposit_from: [
      {
        chain_name: "Terra",
        denom: "uusd",
      },
    ],
    withdraw_to: [
      {
        chain_name: "Terra",
        denom:
          "ibc/4294C3DB67564CF4A0B2BFACC8415A59B38243F6FF9E288FBA34F9B4823BA16E",
      },
    ],
  },
  {
    name: "OSMO",
    address: "secret1zwwealwm0pcl9cul4nt6f38dsy6vzplw8lp3qg",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/osmo.jpeg",
    decimals: 6,
    deposit_from: [
      {
        chain_name: "Osmosis",
        denom: "uosmo",
      },
    ],
    withdraw_to: [
      {
        chain_name: "Osmosis",
        denom:
          "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
      },
    ],
  },
  {
    name: "DVPN",
    address: "",
    code_hash: "",
    image: "/dvpn.jpeg",
    decimals: 6,
    deposit_from: [],
    withdraw_to: [],
  },
];

export type Chain = {
  /** display name of the chain */
  chain_name: string;
  /** channel_id on the chain */
  deposit_channel_id: string;
  /** gas limit for ibc transfer from the chain to Secret Network */
  deposit_gas: number;
  /** channel_id on Secret Network */
  withdarw_channel_id: string;
  /** gas limit for ibc transfer from Secret Network to the chain */
  withdarw_gas: number;
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
};

export const chains: { [chain_name: string]: Chain } = {
  "Secret Network": {
    chain_name: "Secret Network",
    deposit_channel_id: "",
    deposit_gas: 0,
    withdarw_channel_id: "",
    withdarw_gas: 0,
    chain_id: "secret-4",
    bech32_prefix: "secret",
    lcd: "https://lcd-secret.keplr.app",
    rpc: "https://rpc-secret.keplr.app",
    chain_image: "/scrt.svg",
  },
  "Cosmos Hub": {
    chain_name: "Cosmos Hub",
    deposit_channel_id: "channel-235",
    deposit_gas: 110_000,
    withdarw_channel_id: "channel-0",
    withdarw_gas: 30_000,
    chain_id: "cosmoshub-4",
    bech32_prefix: "cosmos",
    lcd: "https://lcd-cosmoshub.keplr.app",
    rpc: "https://rpc-cosmoshub.keplr.app",
    chain_image: "/atom.jpg",
  },
  Terra: {
    chain_name: "Terra",
    deposit_channel_id: "channel-16",
    deposit_gas: 110_000,
    withdarw_channel_id: "channel-2",
    withdarw_gas: 30_000,
    chain_id: "columbus-5",
    bech32_prefix: "terra",
    lcd: "https://lcd-columbus.keplr.app",
    rpc: "https://rpc-columbus.keplr.app",
    chain_image: "/terra.jpg",
  },
  Osmosis: {
    chain_name: "Osmosis",
    deposit_channel_id: "channel-88",
    deposit_gas: 1_500_000,
    withdarw_channel_id: "channel-1",
    withdarw_gas: 30_000,
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    lcd: "https://lcd-osmosis.keplr.app",
    rpc: "https://rpc-osmosis.keplr.app",
    chain_image: "/osmo.jpeg",
  },
};
