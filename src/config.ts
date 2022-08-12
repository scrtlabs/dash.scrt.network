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

export const tokens: Token[] = [
  {
    name: "SCRT",
    address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    code_hash:
      "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e",
    image: "/scrt.svg",
    decimals: 6,
    coingecko_id: "secret",
    deposits: [
      {
        source_chain_name: "Akash",
        from_denom:
          "ibc/13BD0905CFB705ABF84B60209C44071878C9F07A0A2CAC5EDBE315AD3CFD1DF2", // SCRT denom on Akash
      },
      {
        source_chain_name: "Chihuahua",
        from_denom:
          "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09", // SCRT denom on Chihuahua
      },
      {
        source_chain_name: "Cosmos Hub",
        from_denom:
          "ibc/1542F8DC70E7999691E991E1EDEB1B47E65E3A217B1649D347098EE48ACB580F", // SCRT denom on Cosmos
      },
      {
        source_chain_name: "Evmos",
        from_denom:
          "ibc/DC74BE775F57FF32C3C6E14ACD86339DB50632246F6482C81CF5FCE64C0AC5C7", // SCRT denom on Evmos
      },
      {
        source_chain_name: "Gravity Bridge",
        from_denom:
          "ibc/7907EA1A11FD4FC2A815FCAA54948C42F08E3F3C874EE48861386286FEB80160", // SCRT denom on Gravity Bridge
      },
      {
        source_chain_name: "Injective",
        from_denom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A", // SCRT denom on Injective
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Juno
      },
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A", // SCRT denom on Osmosis
      },
      {
        source_chain_name: "Sentinel",
        from_denom:
          "ibc/31FEE1A2A9F9C01113F90BD0BBCCE8FD6BBB8585FAF109A2101827DD1D5B95B8", // SCRT denom on Sentinel
      },
      {
        source_chain_name: "Stargaze",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Stargaze
      },
      {
        source_chain_name: "Terra",
        from_denom:
          "ibc/10BD6ED30BA132AB96F146D71A23B46B2FC19E7D79F52707DC91F2F3A45040AD", // SCRT denom on Terra
      },
      {
        source_chain_name: "Terra Classic",
        from_denom:
          "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09", // SCRT denom on Terra Classic
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Akash",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Chihuahua",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Cosmos Hub",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Evmos",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Gravity Bridge",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Injective",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Juno",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Osmosis",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Sentinel",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Stargaze",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Terra",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Terra Classic",
        from_denom: "uscrt",
      },
    ],
  },
  {
    name: "AKT",
    address: "secret168j5f78magfce5r2j4etaytyuy7ftjkh4cndqw",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/akt.svg",
    decimals: 6,
    coingecko_id: "akash-network",
    deposits: [
      {
        source_chain_name: "Akash",
        from_denom: "uakt",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Akash",
        from_denom:
          "ibc/448B29AB9766D29CC09944EDF6A08573B45A37C55746A45FA3CF53F1B58DF98D", // AKT denom on Secret
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
    coingecko_id: "cosmos",
    deposits: [
      {
        source_chain_name: "Cosmos Hub",
        from_denom: "uatom",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Cosmos Hub",
        from_denom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
    ],
  },
  {
    name: "DVPN",
    address: "secret1k8cge73c3nh32d4u0dsd5dgtmk63shtlrfscj5",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/dvpn.jpeg",
    decimals: 6,
    coingecko_id: "sentinel",
    deposits: [
      {
        source_chain_name: "Sentinel",
        from_denom: "udvpn",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Sentinel",
        from_denom:
          "ibc/E83107E876FF194B54E9AC3099E49DBB7728156F250ABD3E997D2B7E89E0810B",
      },
    ],
  },
  {
    name: "EVMOS",
    address: "secret1grg9unv2ue8cf98t50ea45prce7gcrj2n232kq",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/evmos.jpg",
    decimals: 18,
    coingecko_id: "evmos",
    deposits: [
      {
        source_chain_name: "Evmos",
        from_denom: "aevmos",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Evmos",
        from_denom:
          "ibc/23A8E16C655512DD4AA83769BA695FB8CCA4D1CA220652B894FAB44E53462C59", // EVMOS denom on Secret
      },
    ],
  },
  {
    name: "GRAV",
    address: "secret1dtghxvrx35nznt8es3fwxrv4qh56tvxv22z79d",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/grav.svg",
    decimals: 6,
    coingecko_id: "graviton",
    deposits: [
      {
        source_chain_name: "Gravity Bridge",
        from_denom: "ugraviton",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Gravity Bridge",
        from_denom:
          "ibc/DEEF987757F80419CC651C8323ACD21D6C3D664E51B5E5A29B2663F5AD132A67", // GRAV denom on Secret
      },
    ],
  },
  {
    name: "HUAHUA",
    address: "secret1ntvxnf5hzhzv8g87wn76ch6yswdujqlgmjh32w",
    code_hash:
      "182d7230c396fa8f548220ff88c34cb0291a00046df9ff2686e407c3b55692e9",
    image: "/huahua.jpg",
    decimals: 6,
    coingecko_id: "chihuahua-chain",
    deposits: [
      {
        source_chain_name: "Chihuahua",
        from_denom: "uhuahua",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Chihuahua",
        from_denom:
          "ibc/630E7B10690ADEC9E9CEEE904CE78C522BBCDDC6A081B23FA26A55F6EF40E41E", // HUAHUA denom on Secret
      },
    ],
  },
  {
    name: "INJ",
    address: "secret16cwf53um7hgdvepfp3jwdzvwkt5qe2f9vfkuwv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/inj.svg",
    decimals: 18,
    coingecko_id: "injective-protocol",
    deposits: [
      {
        source_chain_name: "Injective",
        from_denom: "inj",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Injective",
        from_denom:
          "ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30", // INJ denom on Secret
      },
    ],
  },
  {
    name: "JUNO",
    address: "secret1smmc5k24lcn4j2j8f3w0yaeafga6wmzl0qct03",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/juno.svg",
    decimals: 6,
    coingecko_id: "juno-network",
    deposits: [
      {
        source_chain_name: "Juno",
        from_denom: "ujuno",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Juno",
        from_denom:
          "ibc/DF8D00B4B31B55AFCA9BAF192BC36C67AA06D9987DCB96490661BCAB63C27006", // JUNO denom on Secret
      },
    ],
  },
  {
    name: "LUNA",
    address: "secret1w8d0ntrhrys4yzcfxnwprts7gfg5gfw86ccdpf",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/luna2.svg",
    decimals: 6,
    coingecko_id: "terra-luna-2",
    deposits: [
      {
        source_chain_name: "Terra",
        from_denom: "uluna",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Terra",
        from_denom:
          "ibc/28DECFA7FB7E3AB58DC3B3AEA9B11C6C6B6E46356DCC26505205DAD3379984F5", // LUNA denom on Secret
      },
    ],
  },
  {
    name: "LUNC",
    address: "secret1ra7avvjh9fhr7dtr3djutugwj59ptctsrakyyw",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/luna.png",
    decimals: 6,
    coingecko_id: "terra-luna",
    deposits: [
      {
        source_chain_name: "Terra Classic",
        from_denom: "uluna",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Terra Classic",
        from_denom:
          "ibc/D70B0FBF97AEB04491E9ABF4467A7F66CD6250F4382CE5192D856114B83738D2",
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
    coingecko_id: "osmosis",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom: "uosmo",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom:
          "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
      },
    ],
  },
  {
    name: "STARS",
    address: "secret1x0dqckf2khtxyrjwhlkrx9lwwmz44k24vcv2vv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/stars.webp",
    decimals: 6,
    coingecko_id: "stargaze",
    deposits: [
      {
        source_chain_name: "Stargaze",
        from_denom: "ustars",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Stargaze",
        from_denom:
          "ibc/7EAE5BEF3A26B64AFBD89828AFDDB1DC7024A0276D22745201632C40E6E634D0", // STARS denom on Secret
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
    coingecko_id: "terrausd",
    deposits: [
      {
        source_chain_name: "Terra Classic",
        from_denom: "uusd",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Terra Classic",
        from_denom:
          "ibc/4294C3DB67564CF4A0B2BFACC8415A59B38243F6FF9E288FBA34F9B4823BA16E",
      },
    ],
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

export const chains: { [chain_name: string]: Chain } = {
  "Secret Network": {
    chain_name: "Secret Network",
    deposit_channel_id: "",
    deposit_gas: 0,
    withdraw_channel_id: "",
    withdraw_gas: 0,
    chain_id: "secret-4",
    bech32_prefix: "secret",
    lcd: "https://secret-4.api.trivium.network:1317",
    rpc: "https://secret-4.api.trivium.network:9091", // gRPC-web
    chain_image: "/scrt.svg",
    explorer_account: "https://www.mintscan.io/secret/account/",
  },
  Akash: {
    chain_name: "Akash",
    deposit_channel_id: "channel-43",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-21",
    withdraw_gas: 30_000,
    chain_id: "akashnet-2",
    bech32_prefix: "akash",
    lcd: "https://akash.c29r3.xyz:443/api",
    rpc: "https://rpc.akash.forbole.com",
    chain_image: "/akt.svg",
    explorer_account: "https://www.mintscan.io/akash/account/",
  },
  Chihuahua: {
    chain_name: "Chihuahua",
    deposit_channel_id: "channel-16",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-11",
    withdraw_gas: 30_000,
    chain_id: "chihuahua-1",
    bech32_prefix: "chihuahua",
    lcd: "https://api.chihuahua.wtf",
    rpc: "https://rpc.chihuahua.wtf",
    chain_image: "/huahua.jpg",
    explorer_account: "https://ping.pub/chihuahua/account/",
  },
  "Cosmos Hub": {
    chain_name: "Cosmos Hub",
    deposit_channel_id: "channel-235",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-0",
    withdraw_gas: 30_000,
    chain_id: "cosmoshub-4",
    bech32_prefix: "cosmos",
    lcd: "https://lcd-cosmoshub.keplr.app",
    rpc: "https://rpc.cosmoshub.strange.love",
    chain_image: "/atom.jpg",
    explorer_account: "https://www.mintscan.io/cosmos/account/",
  },
  Evmos: {
    chain_name: "Evmos",
    deposit_channel_id: "channel-15",
    deposit_gas: 350_000,
    withdraw_channel_id: "channel-18",
    withdraw_gas: 30_000,
    chain_id: "evmos_9001-2",
    bech32_prefix: "evmos",
    lcd: "https://rest.bd.evmos.org:1317",
    rpc: "https://tendermint.bd.evmos.org:26657",
    chain_image: "/evmos.jpg",
    explorer_account: "https://www.mintscan.io/evmos/account/",
  },
  "Gravity Bridge": {
    chain_name: "Gravity Bridge",
    deposit_channel_id: "channel-79",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-17",
    withdraw_gas: 30_000,
    chain_id: "gravity-bridge-3",
    bech32_prefix: "gravity",
    lcd: "https://lcd.gravity-bridge.ezstaking.io",
    rpc: "https://rpc.gravity-bridge.ezstaking.io",
    chain_image: "/grav.svg",
    explorer_account: "https://www.mintscan.io/gravity-bridge/account/",
  },
  Injective: {
    chain_name: "Injective",
    deposit_channel_id: "channel-88",
    deposit_gas: 350_000,
    withdraw_channel_id: "channel-23",
    withdraw_gas: 30_000,
    chain_id: "injective-1",
    bech32_prefix: "inj",
    lcd: "https://public.lcd.injective.network",
    rpc: "https://tm.injective.network",
    chain_image: "/inj.svg",
    explorer_account: "https://www.mintscan.io/injective/account/",
  },
  Juno: {
    chain_name: "Juno",
    deposit_channel_id: "channel-48",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-8",
    withdraw_gas: 30_000,
    chain_id: "juno-1",
    bech32_prefix: "juno",
    lcd: "https://lcd-juno.itastakers.com",
    rpc: "https://rpc-juno.itastakers.com",
    chain_image: "/juno.svg",
    explorer_account: "https://www.mintscan.io/juno/account/",
  },
  Osmosis: {
    chain_name: "Osmosis",
    deposit_channel_id: "channel-88",
    deposit_gas: 1_500_000,
    withdraw_channel_id: "channel-1",
    withdraw_gas: 30_000,
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    lcd: "https://lcd.osmosis.zone",
    rpc: "https://rpc.osmosis.zone",
    chain_image: "/osmo.jpeg",
    explorer_account: "https://www.mintscan.io/osmosis/account/",
  },
  Sentinel: {
    chain_name: "Sentinel",
    deposit_channel_id: "channel-50",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-3",
    withdraw_gas: 30_000,
    chain_id: "sentinelhub-2",
    bech32_prefix: "sent",
    lcd: "https://api-sentinel-ia.notional.ventures",
    rpc: "https://rpc-sentinel-ia.notional.ventures",
    chain_image: "/dvpn.jpeg",
    explorer_account: "https://www.mintscan.io/sentinel/account/",
  },
  Stargaze: {
    chain_name: "Stargaze",
    deposit_channel_id: "channel-48",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-19",
    withdraw_gas: 30_000,
    chain_id: "stargaze-1",
    bech32_prefix: "stars",
    lcd: "https://rest.stargaze-apis.com",
    rpc: "https://rpc.stargaze-apis.com",
    chain_image: "/stars.webp",
    explorer_account: "https://www.mintscan.io/stargaze/account/",
  },
  Terra: {
    chain_name: "Terra",
    deposit_channel_id: "channel-3",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-16",
    withdraw_gas: 30_000,
    chain_id: "phoenix-1",
    bech32_prefix: "terra",
    lcd: "https://terra-api.polkachu.com",
    rpc: "https://terra-rpc.polkachu.com",
    chain_image: "/luna2.svg",
    explorer_account: "https://finder.terra.money/mainnet/address/",
  },
  "Terra Classic": {
    chain_name: "Terra Classic",
    deposit_channel_id: "channel-16",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-2",
    withdraw_gas: 30_000,
    chain_id: "columbus-5",
    bech32_prefix: "terra",
    lcd: "https://lcd-columbus.keplr.app",
    rpc: "https://rpc-columbus.keplr.app",
    chain_image: "/terra.jpg",
    explorer_account: "https://finder.terra.money/classic/address/",
  },
};
