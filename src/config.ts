export type Token = {
  name: string;
  address: string;
  code_hash: string;
  image: string;
  decimals: number;
  deposit_from: DepositFrom[];

  withdraw_to: WithdrawTo[];
};

export type DepositFrom = {
  channel_id: string;
  denom: string;
  gas: number;
  bech32_prefix: string;
  chain_name: string;
  chain_image: string;
  chain_id: string;
  lcd: string;
  rpc: string;
};

export type WithdrawTo = {
  channel_id: string;
  denom: string;
  gas: number;
  bech32_prefix: string;
  chain_name: string;
  chain_image: string;
  chain_id: string;
  lcd: string;
  rpc: string;
};

export const tokens: Token[] = [
  {
    name: "SCRT",
    address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    code_hash:
      "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e",
    image: "scrt.svg",
    decimals: 6,
    denom: "uscrt",
    source_denom: "uscrt",
    chain_id: "secret-4",
    bech32_prefix: "secret",
    lcd: "https://lcd-secret.keplr.app",
    rpc: "https://rpc-secret.keplr.app",
    chain_name: "Secret Network",
    deposit_from: [
      {
        channel_id: "channel-235",
        denom: "TODO",
        gas: 110000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "atom.jpg",
        chain_id: "cosmoshub-4",
        lcd: "https://lcd-cosmoshub.keplr.app",
        rpc: "https://rpc-cosmoshub.keplr.app",
      },
    ],
  },
  {
    name: "ATOM",
    address: "secret14mzwd0ps5q277l20ly2q3aetqe3ev4m4260gf4",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "atom.jpg",
    decimals: 6,
    deposit_from: [
      {
        channel_id: "channel-235",
        denom: "uatom",
        gas: 110000,
        bech32_prefix: "cosmos",
        chain_name: "Cosmos Hub",
        chain_image: "atom.jpg",
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
        chain_image: "atom.jpg",
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
    image: "luna.png",
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
        chain_image: "luna.png",
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
        chain_image: "luna.png",
      },
    ],
  },
  {
    name: "UST",
    address: "secret129h4vu66y3gry6wzwa24rw0vtqjyn8tujuwtn9",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "ust.png",
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
        chain_image: "ust.png",
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
        chain_image: "ust.png",
      },
    ],
  },
  {
    name: "OSMO",
    address: "secret1zwwealwm0pcl9cul4nt6f38dsy6vzplw8lp3qg",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "osmo.jpeg",
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
        chain_image: "osmo.jpeg",
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
        chain_image: "osmo.jpeg",
      },
    ],
  },
  //   {
  //     name: "DVPN",
  //     address: "",
  //     code_hash: "",
  //     image: "dvpn.jpeg",
  //     decimals: 6,
  //     denom: "ibc/dvpn",
  //     source_denom: "udvpn",
  //     chain_id: "sentinelhub-2",
  //     bech32_prefix: "sent",
  //     lcd: "https://lcd-sentinel.keplr.app",
  //     rpc: "https://rpc-sentinel.keplr.app",
  //     chain_name: "Sentinel",
  //     channel_id: "",
  //     transfer_gas: 0,
  //   },
];
