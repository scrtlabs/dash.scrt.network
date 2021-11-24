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
  /** channel_id on the other chain */
  channel_id: string;
  /** denom on the other chain */
  denom: string;
  /** gas limit for ibc transfer on the other chain */
  gas: number;
  /** bech32 prefix of the other chain */
  bech32_prefix: string;
  /** display name for the other chain */
  chain_name: string;
  /** logo of the other chain */
  chain_image: string;
  /** chain-id of the other chain */
  chain_id: string;
  /** lcd url of the other chain */
  lcd: string;
  /** rpc url of the other chain */
  rpc: string;
};

export type Withdraw = {
  /** channel_id on Secret Network */
  channel_id: string;
  /** denom on Secret Network */
  denom: string;
  /** gas limit for ibc transfer on Secret Network */
  gas: number;
  /** bech32 prefix of the other chain */
  bech32_prefix: string;
  /** display name for the other chain */
  chain_name: string;
  /** logo of the other chain */
  chain_image: string;
  /** chain-id of the other chain */
  chain_id: string;
  /** lcd url of the other chain */
  lcd: string;
  /** rpc url of the other chain */
  rpc: string;
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
        channel_id: "channel-235",
        denom: "TODO",
        gas: 110000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "/atom.jpg",
        chain_id: "cosmoshub-4",
        lcd: "https://lcd-cosmoshub.keplr.app",
        rpc: "https://rpc-cosmoshub.keplr.app",
      },
      {
        channel_id: "channel-16",
        denom: "TODO",
        gas: 110000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
      {
        channel_id: "channel-16",
        denom: "TODO",
        gas: 110000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
      {
        channel_id: "channel-88",
        denom: "TODO",
        gas: 15000000,
        chain_id: "osmosis-1",
        bech32_prefix: "osmo",
        lcd: "https://lcd-osmosis.keplr.app",
        rpc: "https://rpc-osmosis.keplr.app",
        chain_name: "Osmosis",
        chain_image: "/osmo.jpeg",
      },
    ],
    withdraw_to: [
      {
        channel_id: "channel-0",
        denom: "uscrt",
        gas: 25000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "/atom.jpg",
        chain_id: "cosmoshub-4",
        lcd: "https://lcd-cosmoshub.keplr.app",
        rpc: "https://rpc-cosmoshub.keplr.app",
      },
      {
        channel_id: "channel-2",
        denom: "uscrt",
        gas: 25000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
      {
        channel_id: "channel-2",
        denom: "uscrt",
        gas: 25000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
      {
        channel_id: "channel-1",
        denom: "uscrt",
        gas: 25000,
        chain_id: "osmosis-1",
        bech32_prefix: "osmo",
        lcd: "https://lcd-osmosis.keplr.app",
        rpc: "https://rpc-osmosis.keplr.app",
        chain_name: "Osmosis",
        chain_image: "/osmo.jpeg",
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
        channel_id: "channel-235",
        denom: "uatom",
        gas: 110000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "/atom.jpg",
        chain_id: "cosmoshub-4",
        lcd: "https://lcd-cosmoshub.keplr.app",
        rpc: "https://rpc-cosmoshub.keplr.app",
      },
    ],
    withdraw_to: [
      {
        channel_id: "channel-0",
        denom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        gas: 25000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "/atom.jpg",
        chain_id: "cosmoshub-4",
        lcd: "https://lcd-cosmoshub.keplr.app",
        rpc: "https://rpc-cosmoshub.keplr.app",
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
        channel_id: "channel-16",
        denom: "uluna",
        gas: 110000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
    ],
    withdraw_to: [
      {
        channel_id: "channel-2",
        denom:
          "ibc/D70B0FBF97AEB04491E9ABF4467A7F66CD6250F4382CE5192D856114B83738D2",
        gas: 25000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
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
        channel_id: "channel-16",
        denom: "uusd",
        gas: 110000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
      },
    ],
    withdraw_to: [
      {
        channel_id: "channel-2",
        denom:
          "ibc/4294C3DB67564CF4A0B2BFACC8415A59B38243F6FF9E288FBA34F9B4823BA16E",
        gas: 25000,
        chain_id: "columbus-5",
        bech32_prefix: "terra",
        lcd: "https://lcd-columbus.keplr.app",
        rpc: "https://rpc-columbus.keplr.app",
        chain_name: "Terra",
        chain_image: "/terra.jpg",
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
        channel_id: "channel-88",
        denom: "uosmo",
        gas: 15000000,
        chain_id: "osmosis-1",
        bech32_prefix: "osmo",
        lcd: "https://lcd-osmosis.keplr.app",
        rpc: "https://rpc-osmosis.keplr.app",
        chain_name: "Osmosis",
        chain_image: "/osmo.jpeg",
      },
    ],
    withdraw_to: [
      {
        channel_id: "channel-1",
        denom:
          "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
        gas: 25000,
        chain_id: "osmosis-1",
        bech32_prefix: "osmo",
        lcd: "https://lcd-osmosis.keplr.app",
        rpc: "https://rpc-osmosis.keplr.app",
        chain_name: "Osmosis",
        chain_image: "/osmo.jpeg",
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

export default tokens;
