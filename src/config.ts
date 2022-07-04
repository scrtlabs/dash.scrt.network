import { tokenIcons } from "./assets/images";
import { TokenNames, Token, Chain } from "./types";

export const TokensList: Token[] = [
  {
    name: TokenNames.scrt,
    address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    code_hash:
      "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e",
    image: tokenIcons.scrt,
    decimals: 6,
    coingecko_id: "secret",
    deposits: [
      {
        source_chain_name: "Cosmos Hub",
        from_denom:
          "ibc/1542F8DC70E7999691E991E1EDEB1B47E65E3A217B1649D347098EE48ACB580F", // SCRT denom on Cosmos
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
        source_chain_name: "Juno",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Juno
      },
      {
        source_chain_name: "Terra",
        from_denom:
          "ibc/10BD6ED30BA132AB96F146D71A23B46B2FC19E7D79F52707DC91F2F3A45040AD", // SCRT denom on Terra
      },
      // {
      //   source_chain_name: "Evmos",
      //   from_denom:
      //     "ibc/DC74BE775F57FF32C3C6E14ACD86339DB50632246F6482C81CF5FCE64C0AC5C7", // SCRT denom on Evmos
      // },
      {
        source_chain_name: "Stargaze",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Stargaze
      },
      {
        source_chain_name: "Gravity Bridge",
        from_denom:
          "ibc/7907EA1A11FD4FC2A815FCAA54948C42F08E3F3C874EE48861386286FEB80160", // SCRT denom on Gravity Bridge
      },
      {
        source_chain_name: "Terra Classic",
        from_denom:
          "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09", // SCRT denom on Terra Classic
      },
      {
        source_chain_name: "Chihuahua",
        from_denom:
          "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09", // SCRT denom on Chihuahua
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Cosmos Hub",
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
        target_chain_name: "Juno",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Terra",
        from_denom: "uscrt",
      },
      // {
      //   target_chain_name: "Evmos",
      //   from_denom: "uscrt",
      // },
      {
        target_chain_name: "Stargaze",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Gravity Bridge",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Terra Classic",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Chihuahua",
        from_denom: "uscrt",
      },
    ],
  },
  {
    name: TokenNames.atom,
    address: "secret14mzwd0ps5q277l20ly2q3aetqe3ev4m4260gf4",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.atom,
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
    name: TokenNames.osmo,
    address: "secret1zwwealwm0pcl9cul4nt6f38dsy6vzplw8lp3qg",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.osmo,
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
    name: TokenNames.juno,
    address: "secret1smmc5k24lcn4j2j8f3w0yaeafga6wmzl0qct03",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.juno,
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
    name: TokenNames.luna,
    address: "secret1w8d0ntrhrys4yzcfxnwprts7gfg5gfw86ccdpf",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: tokenIcons.luna,
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
    name: TokenNames.stars,
    address: "secret1x0dqckf2khtxyrjwhlkrx9lwwmz44k24vcv2vv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: tokenIcons.stars,
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
    name: TokenNames.gravity,
    address: "secret1x0dqckf2khtxyrjwhlkrx9lwwmz44k24vcv2vv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: tokenIcons.grav,
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
          "ibc/DEEF987757F80419CC651C8323ACD21D6C3D664E51B5E5A29B2663F5AD132A67", // GRAVITON denom on Secret
      },
    ],
  },
  {
    name: TokenNames.dvpn,
    address: "secret1k8cge73c3nh32d4u0dsd5dgtmk63shtlrfscj5",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.dvpn,
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
    name: TokenNames.lunc,
    address: "secret1ra7avvjh9fhr7dtr3djutugwj59ptctsrakyyw",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.lunc,
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
    name: TokenNames.ustc,
    address: "secret129h4vu66y3gry6wzwa24rw0vtqjyn8tujuwtn9",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: tokenIcons.ustc,
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
  {
    name: TokenNames.huahua,
    address: "secret1ntvxnf5hzhzv8g87wn76ch6yswdujqlgmjh32w",
    code_hash:
      "182d7230c396fa8f548220ff88c34cb0291a00046df9ff2686e407c3b55692e9",
    image: tokenIcons.huahua,
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
    name: TokenNames.evmos,
    address: "", // "secret1grg9unv2ue8cf98t50ea45prce7gcrj2n232kq",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: tokenIcons.evmos,
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
    name: TokenNames.akt,
    address: "",
    code_hash: "",
    image: tokenIcons.akt,
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
        from_denom: "ibc/",
      },
    ],
  },
];

export const ChainList: { [chain_name: string]: Chain } = {
  "Secret Network": {
    chain_name: "Secret Network",
    deposit_channel_id: "",
    deposit_gas: 0,
    withdraw_channel_id: "",
    withdraw_gas: 0,
    chain_id: "secret-4",
    bech32_prefix: "secret",
    lcd: "https://api.roninventures.io",
    rpc: "https://web-rpc.roninventures.io", // gRPC-web
    chain_image: tokenIcons.scrt,
    explorer_account: "https://www.mintscan.io/secret/account/",
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
    rpc: "https://rpc.atomscan.com/",
    chain_image: tokenIcons.atom,
    explorer_account: "https://www.mintscan.io/cosmos/account/",
  },
  "Terra Classic": {
    chain_name: "Terra Classic",
    deposit_channel_id: "channel-16",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-2",
    withdraw_gas: 30_000,
    chain_id: "columbus-5",
    bech32_prefix: "terra",
    lcd: "https://lcd.terra.dev",
    rpc: "https://rpc-terra-ia.notional.ventures/",
    chain_image: tokenIcons.lunc,
    explorer_account: "https://finder.terra.money/mainnet/address/",
  },
  Terra: {
    chain_name: "Terra 2",
    deposit_channel_id: "channel-3",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-16",
    withdraw_gas: 30_000,
    chain_id: "phoenix-1",
    bech32_prefix: "terra",
    lcd: "https://terra-api.polkachu.com",
    rpc: "https://terra-rpc.polkachu.com",
    chain_image: tokenIcons.luna,
    explorer_account: "https://finder.terra.money/mainnet/address/",
  },
  Osmosis: {
    chain_name: "Osmosis",
    deposit_channel_id: "channel-88",
    deposit_gas: 130_000,
    withdraw_channel_id: "channel-1",
    withdraw_gas: 30_000,
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    lcd: "https://lcd-osmosis.keplr.app",
    rpc: "https://rpc-osmosis.blockapsis.com/",
    chain_image: tokenIcons.osmo,
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
    lcd: "https://lcd-sentinel.keplr.app",
    rpc: "https://rpc-sentinel.keplr.app",
    chain_image: tokenIcons.dvpn,
    explorer_account: "https://www.mintscan.io/sentinel/account/",
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
    chain_image: tokenIcons.juno,
    explorer_account: "https://www.mintscan.io/juno/account/",
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
    chain_image: tokenIcons.huahua,
    explorer_account: "https://ping.pub/chihuahua/account/",
  },
  Evmos: {
    chain_name: "Evmos",
    deposit_channel_id: "channel-15",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-18",
    withdraw_gas: 30_000,
    chain_id: "evmos_9001-2",
    bech32_prefix: "evmos",
    lcd: "https://lcd.evmos.ezstaking.io",
    rpc: "https://rpc.evmos.ezstaking.io",
    chain_image: tokenIcons.evmos,
    explorer_account: "https://www.mintscan.io/evmos/account/",
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
    chain_image: tokenIcons.stars,
    explorer_account: "https://www.mintscan.io/stargaze/account/",
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
    chain_image: tokenIcons.grav,
    explorer_account: "https://www.mintscan.io/gravity-bridge/account/",
  },
};
