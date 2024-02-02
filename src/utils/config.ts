import { CHAINS } from '@axelar-network/axelarjs-sdk'
import { ibcDenom } from 'secretjs'

export type Chain = {
  /** display name of the chain */
  chain_name: string
  /** channel_id on the chain */
  deposit_channel_id: string
  /** gas limit for ibc transfer from the chain to Secret Network */
  deposit_gas: number
  /** gas denom for ibc transfer from the chain to Secret Network */
  deposit_gas_denom: string
  /** channel_id on Secret Network */
  withdraw_channel_id: string
  /** gas limit for ibc transfer from Secret Network to the chain */
  withdraw_gas: number
  /** bech32 prefix of addresses on the chain */
  bech32_prefix: string
  /** logo of the chain */
  chain_image: string
  /** chain-id of the chain */
  chain_id: string
  /** lcd url of the chain */
  lcd: string
  /** explorer link for accounts */
  explorer_account: string
  /** explorer link for txs */
  explorer_tx?: string
}

export const chains: { [chain_name: string]: Chain } = {
  'Secret Network': {
    chain_name: 'Secret Network',
    deposit_channel_id: '',
    deposit_gas: 0,
    deposit_gas_denom: 'uscrt',
    withdraw_channel_id: '',
    withdraw_gas: 0,
    chain_id: 'secret-4',
    bech32_prefix: 'secret',
    lcd: 'https://lcd.mainnet.secretsaturn.net',
    chain_image: 'img/assets/scrt.svg',
    explorer_account: 'https://www.mintscan.io/secret/account/'
  },
  Agoric: {
    chain_name: 'Agoric',
    deposit_channel_id: 'channel-10',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ubld',
    withdraw_channel_id: 'channel-51',
    withdraw_gas: 30_000,
    chain_id: 'agoric-3',
    bech32_prefix: 'agoric',
    lcd: 'https://main.api.agoric.net',
    chain_image: '/bld.svg',
    explorer_account: 'https://agoric.explorers.guru/account/'
  },
  Akash: {
    chain_name: 'Akash',
    deposit_channel_id: 'channel-43',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uakt',
    withdraw_channel_id: 'channel-21',
    withdraw_gas: 30_000,
    chain_id: 'akashnet-2',
    bech32_prefix: 'akash',
    lcd: 'https://akash-api.lavenderfive.com',
    chain_image: '/akt.svg',
    explorer_account: 'https://www.mintscan.io/akash/account/'
  },
  Andromeda: {
    chain_name: 'Andromeda',
    deposit_channel_id: 'channel-2',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uandr',
    withdraw_channel_id: 'channel-97',
    withdraw_gas: 30_000,
    chain_id: 'andromeda-1',
    bech32_prefix: 'andr',
    lcd: 'https://andro.api.m.stavr.tech',
    chain_image: '/andr.png',
    explorer_account: 'https://explorer.stavr.tech/Andromeda-Mainnet/account/'
  },
  Archway: {
    chain_name: 'Archway',
    deposit_channel_id: 'channel-21',
    deposit_gas: 150_000,
    deposit_gas_denom: 'aarch',
    withdraw_channel_id: 'channel-84',
    withdraw_gas: 30_000,
    chain_id: 'archway-1',
    bech32_prefix: 'archway',
    lcd: 'https://archway-api.lavenderfive.com:443',
    chain_image: '/archway.svg',
    explorer_account: 'https://www.mintscan.io/archway/account/'
  },
  Axelar: {
    chain_name: 'Axelar',
    deposit_channel_id: 'channel-12',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uaxl',
    withdraw_channel_id: 'channel-20',
    withdraw_gas: 30_000,
    chain_id: 'axelar-dojo-1',
    bech32_prefix: 'axelar',
    lcd: 'https://lcd-axelar.imperator.co:443',
    chain_image: '/axl.svg',
    explorer_account: 'https://axelarscan.io/account/'
  },
  Carbon: {
    chain_name: 'Carbon',
    deposit_channel_id: 'channel-XX',
    deposit_gas: 150_000,
    deposit_gas_denom: 'dswth',
    withdraw_channel_id: 'channel-XX',
    withdraw_gas: 30_000,
    chain_id: 'carbon-1',
    bech32_prefix: 'swth',
    lcd: 'https://carbon-api.lavenderfive.com:443',
    chain_image: '/swth.svg',
    explorer_account: 'https://ping.pub/carbon/account/'
  },
  Celestia: {
    chain_name: 'Celestia',
    deposit_channel_id: 'channel-14',
    deposit_gas: 150_000,
    deposit_gas_denom: 'utia',
    withdraw_channel_id: 'channel-91',
    withdraw_gas: 30_000,
    chain_id: 'celestia',
    bech32_prefix: 'celestia',
    lcd: 'https://celestia-api.lavenderfive.com:443',
    chain_image: '/celestia.svg',
    explorer_account: 'https://www.mintscan.io/celestia/account/'
  },
  Chihuahua: {
    chain_name: 'Chihuahua',
    deposit_channel_id: 'channel-16',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uhuahua',
    withdraw_channel_id: 'channel-11',
    withdraw_gas: 30_000,
    chain_id: 'chihuahua-1',
    bech32_prefix: 'chihuahua',
    lcd: 'https://chihuahua-api.lavenderfive.com',
    chain_image: '/huahua.svg',
    explorer_account: 'https://ping.pub/chihuahua/account/'
  },
  Comdex: {
    chain_name: 'Comdex',
    deposit_channel_id: 'channel-65',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ucmdx',
    withdraw_channel_id: 'channel-63',
    withdraw_gas: 30_000,
    chain_id: 'comdex-1',
    bech32_prefix: 'comdex',
    lcd: 'https://comdex-api.lavenderfive.com/',
    chain_image: '/cmdx.svg',
    explorer_account: 'https://www.mintscan.io/comdex/account/'
  },
  Composable: {
    chain_name: 'Composable',
    deposit_channel_id: 'channel-14',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ppica',
    withdraw_channel_id: 'channel-80',
    withdraw_gas: 30_000,
    chain_id: 'centauri-1',
    bech32_prefix: 'centauri',
    lcd: 'https://composable-api.lavenderfive.com',
    chain_image: '/composable.svg',
    explorer_account: 'https://explorer.nodestake.top/composable/account/'
  },
  'Cosmos Hub': {
    chain_name: 'Cosmos Hub',
    deposit_channel_id: 'channel-235',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uatom',
    withdraw_channel_id: 'channel-0',
    withdraw_gas: 30_000,
    chain_id: 'cosmoshub-4',
    bech32_prefix: 'cosmos',
    lcd: 'https://cosmoshub-api.lavenderfive.com:443',
    chain_image: '/atom.svg',
    explorer_account: 'https://www.mintscan.io/cosmos/account/'
  },
  dYdX: {
    chain_name: 'dYdX',
    deposit_channel_id: 'channel-2',
    deposit_gas: 150_000,
    deposit_gas_denom: 'adydx',
    withdraw_channel_id: 'channel-89',
    withdraw_gas: 50_000,
    chain_id: 'dydx-mainnet-1',
    bech32_prefix: 'dydx',
    lcd: 'https://dydx-api.lavenderfive.com:443',
    chain_image: '/dydx.svg',
    explorer_account: 'https://www.mintscan.io/dydx/account/'
  },
  /*   Crescent: {
    chain_name: 'Crescent',
    deposit_channel_id: 'channel-10',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ucre',
    withdraw_channel_id: 'channel-24',
    withdraw_gas: 30_000,
    chain_id: 'crescent-1',
    bech32_prefix: 'cre',
    lcd: 'https://mainnet.crescent.network:1317',
    chain_image: '/cre.svg',
    explorer_account: 'https://www.mintscan.io/crescent/account/',
  }, */
  Evmos: {
    chain_name: 'Evmos',
    deposit_channel_id: 'channel-15',
    deposit_gas: 350_000,
    deposit_gas_denom: 'aevmos',
    withdraw_channel_id: 'channel-18',
    withdraw_gas: 30_000,
    chain_id: 'evmos_9001-2',
    bech32_prefix: 'evmos',
    lcd: 'https://evmos-api.lavenderfive.com',
    chain_image: '/evmos.svg',
    explorer_account: 'https://www.mintscan.io/evmos/account/'
  },
  'Gravity Bridge': {
    chain_name: 'Gravity Bridge',
    deposit_channel_id: 'channel-79',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ugraviton',
    withdraw_channel_id: 'channel-17',
    withdraw_gas: 30_000,
    chain_id: 'gravity-bridge-3',
    bech32_prefix: 'gravity',
    lcd: 'https://gravitybridge-api.lavenderfive.com/',
    chain_image: '/grav.svg',
    explorer_account: 'https://www.mintscan.io/gravity-bridge/account/'
  },
  Injective: {
    chain_name: 'Injective',
    deposit_channel_id: 'channel-88',
    deposit_gas: 350_000,
    deposit_gas_denom: 'inj',
    withdraw_channel_id: 'channel-23',
    withdraw_gas: 30_000,
    chain_id: 'injective-1',
    bech32_prefix: 'inj',
    lcd: 'https://injective-api.lavenderfive.com',
    chain_image: '/inj.svg',
    explorer_account: 'https://www.mintscan.io/injective/account/'
  },
  Jackal: {
    chain_name: 'Jackal',
    deposit_channel_id: 'channel-2',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ujkl',
    withdraw_channel_id: 'channel-62',
    withdraw_gas: 30_000,
    chain_id: 'jackal-1',
    bech32_prefix: 'jkl',
    lcd: 'https://api.jackal.nodestake.top',
    chain_image: '/jkl.svg',
    explorer_account: 'https://explorer.nodestake.top/jackal/account/'
  },
  Juno: {
    chain_name: 'Juno',
    deposit_channel_id: 'channel-48',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ujuno',
    withdraw_channel_id: 'channel-8',
    withdraw_gas: 30_000,
    chain_id: 'juno-1',
    bech32_prefix: 'juno',
    lcd: 'https://juno-api.lavenderfive.com:443',
    chain_image: '/juno.svg',
    explorer_account: 'https://www.mintscan.io/juno/account/'
  },
  Migaloo: {
    chain_name: 'Migaloo',
    deposit_channel_id: 'channel-4',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uwhale',
    withdraw_channel_id: 'channel-57',
    withdraw_gas: 30_000,
    chain_id: 'migaloo-1',
    bech32_prefix: 'migaloo',
    lcd: 'https://migaloo-api.cosmosrescue.com',
    chain_image: '/migaloo.svg',
    explorer_account: 'https://migaloo.explorers.guru/account/'
  },
  Neutron: {
    chain_name: 'Neutron',
    deposit_channel_id: 'channel-XX',
    deposit_gas: 150_000,
    deposit_gas_denom: 'untrn',
    withdraw_channel_id: 'channel-XX',
    withdraw_gas: 30_000,
    chain_id: 'neutron-1',
    bech32_prefix: 'neutron',
    lcd: 'https://rest-kralum.neutron-1.neutron.org',
    chain_image: '/ntrn.svg',
    explorer_account: 'https://www.mintscan.io/neutron/account/'
  },
  Noble: {
    chain_name: 'Noble',
    deposit_channel_id: 'channel-17',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uusdc',
    withdraw_channel_id: 'channel-88',
    withdraw_gas: 30_000,
    chain_id: 'noble-1',
    bech32_prefix: 'noble',
    lcd: 'https://noble-api.polkachu.com',
    chain_image: '/noble.svg',
    explorer_account: 'https://www.mintscan.io/noble/account/'
  },
  Nolus: {
    chain_name: 'Nolus',
    deposit_channel_id: 'channel-XX',
    deposit_gas: 150_000,
    deposit_gas_denom: 'unls',
    withdraw_channel_id: 'channel-783',
    withdraw_gas: 30_000,
    chain_id: 'pirin-1',
    bech32_prefix: 'nolus',
    lcd: 'https://nolus-api.lavenderfive.com:443',
    chain_image: '/nolus.svg',
    explorer_account: 'https://ping.pub/nolus/account/'
  },
  Kujira: {
    chain_name: 'Kujira',
    deposit_channel_id: 'channel-10',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ukuji',
    withdraw_channel_id: 'channel-22',
    withdraw_gas: 30_000,
    chain_id: 'kaiyo-1',
    bech32_prefix: 'kujira',
    lcd: 'https://kujira-api.polkachu.com/',
    chain_image: '/kuji.svg',
    explorer_account: 'https://ping.pub/kujira/account/'
  },
  Osmosis: {
    chain_name: 'Osmosis',
    deposit_channel_id: 'channel-88',
    deposit_gas: 700_000,
    deposit_gas_denom: 'uosmo',
    withdraw_channel_id: 'channel-1',
    withdraw_gas: 30_000,
    chain_id: 'osmosis-1',
    bech32_prefix: 'osmo',
    lcd: 'https://osmosis-rest.publicnode.com',
    chain_image: '/osmo.svg',
    explorer_account: 'https://www.mintscan.io/osmosis/account/'
  },
  Persistence: {
    chain_name: 'Persistence',
    deposit_channel_id: 'channel-82',
    deposit_gas: 300_000,
    deposit_gas_denom: 'uxprt',
    withdraw_channel_id: 'channel-64',
    withdraw_gas: 30_000,
    chain_id: 'core-1',
    bech32_prefix: 'persistence',
    lcd: 'https://persistence-api.polkachu.com',
    chain_image: '/xprt.svg',
    explorer_account: 'https://www.mintscan.io/persistence/account/'
  },
  Quicksilver: {
    chain_name: 'Quicksilver',
    deposit_channel_id: 'channel-52',
    deposit_gas: 300_000,
    deposit_gas_denom: 'uqck',
    withdraw_channel_id: 'channel-65',
    withdraw_gas: 30_000,
    chain_id: 'quicksilver-2',
    bech32_prefix: 'quick',
    lcd: 'https://quicksilver-api.lavenderfive.com:443',
    chain_image: '/qck.svg',
    explorer_account: 'https://www.mintscan.io/quicksilver/account/'
  },
  Sentinel: {
    chain_name: 'Sentinel',
    deposit_channel_id: 'channel-50',
    deposit_gas: 150_000,
    deposit_gas_denom: 'udvpn',
    withdraw_channel_id: 'channel-3',
    withdraw_gas: 30_000,
    chain_id: 'sentinelhub-2',
    bech32_prefix: 'sent',
    lcd: 'https://lcd-sentinel.whispernode.com:443',
    chain_image: '/dvpn.svg',
    explorer_account: 'https://www.mintscan.io/sentinel/account/'
  },
  /*   Sifchain: {
    chain_name: 'Sifchain',
    deposit_channel_id: 'channel-65',
    deposit_gas: 150_000,
    deposit_gas_denom: 'urowan',
    withdraw_channel_id: 'channel-15',
    withdraw_gas: 30_000,
    chain_id: 'sifchain-1',
    bech32_prefix: 'sif',
    lcd: 'https://api-sifchain-ia.cosmosia.notional.ventures',
    chain_image: '/rowan.svg',
    explorer_account: 'https://www.mintscan.io/sifchain/account/',
  }, */
  Stargaze: {
    chain_name: 'Stargaze',
    deposit_channel_id: 'channel-48',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ustars',
    withdraw_channel_id: 'channel-19',
    withdraw_gas: 30_000,
    chain_id: 'stargaze-1',
    bech32_prefix: 'stars',
    lcd: 'https://rest.stargaze-apis.com',
    chain_image: '/stars.svg',
    explorer_account: 'https://www.mintscan.io/stargaze/account/'
  },
  Stride: {
    chain_name: 'Stride',
    deposit_channel_id: 'channel-40',
    deposit_gas: 150_000,
    deposit_gas_denom: 'ustrd',
    withdraw_channel_id: 'channel-37',
    withdraw_gas: 30_000,
    chain_id: 'stride-1',
    bech32_prefix: 'stride',
    lcd: 'https://stride-api.lavenderfive.com',
    chain_image: '/stride.svg',
    explorer_account: 'https://www.mintscan.io/stride/account/'
  },
  Terra: {
    chain_name: 'Terra',
    deposit_channel_id: 'channel-3',
    deposit_gas: 150_000,
    deposit_gas_denom: 'uluna',
    withdraw_channel_id: 'channel-16',
    withdraw_gas: 30_000,
    chain_id: 'phoenix-1',
    bech32_prefix: 'terra',
    lcd: 'https://phoenix-lcd.terra.dev',
    chain_image: '/luna2.svg',
    explorer_account: 'https://finder.terra.money/mainnet/address/'
  }
}

export type Token = {
  /** display name of the token */
  name: string
  /** Short description of the token (e.g. Private SCRT) */
  description?: string
  /** a snip20 token that's originated from Secret Network */
  is_snip20?: boolean
  /** a ICS20 token that's originated from Secret Network */
  is_ics20?: boolean
  /** secret contract address of the token */
  axelar_denom?: string
  /** denom name of ICS20 token in axelar */
  address: string
  /** secret contract code hash of the token */
  code_hash: string
  /** logo of the token */
  image: string
  /** decimals of the token */
  decimals: number
  /** coingeck id to get usd price */
  coingecko_id: string
  /** how to deposit this token into Secret Network */
  deposits: Deposit[]
  /** how to withdraw this token out of Secret Network */
  withdrawals: Withdraw[]
}

export type Deposit = {
  /** display name of the source chain */
  chain_name: string
  /** Axelar chain name of the source chain */
  axelar_chain_name?: string
  /** Axelar channel name of the source chain */
  axelar_channel_id?: string
  /** denom on the other chain */
  denom: string
  /** channel_id on the chain (snip20) */
  channel_id?: string
  /** gas limit for ibc transfer from the chain to Secret Network (snip20) */
  gas?: number
  /** Flag needed when assets needs more than 1 hop for chains for SKIP API **/
  needsSkip?: boolean
}

export type Withdraw = {
  /** display name of the target chain */
  chain_name: string
  /** denom on Secret Network */
  denom: string
  /** Axelar chain name of the source chain */
  axelar_chain_name?: string
  /** channel_id on Secret Network (snip20) */
  channel_id?: string
  /** gas limit for ibc transfer from Secret Network to the chain (snip20) */
  gas?: number
  /** Flag needed when assets needs more than 1 hop for chains for SKIP API **/
  needsSkip?: boolean
}

// Native tokens of chains (and tokens from external chains)
export const tokens: Token[] = [
  {
    name: 'SCRT',
    description: 'Secret',
    address: 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek',
    code_hash: 'af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e',
    image: '/scrt.svg',
    decimals: 6,
    coingecko_id: 'secret',
    deposits: [
      {
        chain_name: 'Agoric',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Agoric'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Akash',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Akash'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Andromeda',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Andromeda'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Archway',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Archway'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Axelar',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Axelar'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Celestia',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Celestia'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Chihuahua',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Chihuahua'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Comdex',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Comdex'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Composable'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Cosmos Hub',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Cosmos Hub'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'dYdX',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['dYdX'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      /*       {
        chain_name: 'Crescent',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Crescent'].deposit_channel_id,
              incomingPortId: 'transfer',
            },
          ],
          'uscrt'
        ),
      }, */
      {
        chain_name: 'Evmos',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Evmos'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Gravity Bridge',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Gravity Bridge'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Injective',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Injective'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Jackal',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Jackal'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Juno'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Kujira'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Noble',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Noble'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Nolus',
        needsSkip: true,
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-0',
              incomingPortId: 'transfer'
            },
            {
              incomingChannelId: chains['Osmosis'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Osmosis'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Persistence',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Persistence'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Quicksilver',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Quicksilver'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Sentinel',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Sentinel'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      /*       {
        chain_name: 'Sifchain',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Sifchain'].deposit_channel_id,
              incomingPortId: 'transfer',
            },
          ],
          'uscrt'
        ),
      }, */
      {
        chain_name: 'Stargaze',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stargaze'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      },
      {
        chain_name: 'Terra',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Terra'].deposit_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uscrt'
        )
      }
    ],
    withdrawals: [
      {
        chain_name: 'Agoric',
        denom: 'uscrt'
      },
      {
        chain_name: 'Akash',
        denom: 'uscrt'
      },
      {
        chain_name: 'Andromeda',
        denom: 'uscrt'
      },
      {
        chain_name: 'Archway',
        denom: 'uscrt'
      },
      {
        chain_name: 'Axelar',
        denom: 'uscrt'
      },
      {
        chain_name: 'Celestia',
        denom: 'uscrt'
      },
      {
        chain_name: 'Chihuahua',
        denom: 'uscrt'
      },
      {
        chain_name: 'Comdex',
        denom: 'uscrt'
      },
      {
        chain_name: 'Composable',
        denom: 'uscrt'
      },
      {
        chain_name: 'Cosmos Hub',
        denom: 'uscrt'
      },
      {
        chain_name: 'dYdX',
        denom: 'uscrt'
      },
      /*       {
        chain_name: 'Crescent',
        denom: 'uscrt',
      }, */
      {
        chain_name: 'Evmos',
        denom: 'uscrt'
      },
      {
        chain_name: 'Gravity Bridge',
        denom: 'uscrt'
      },
      {
        chain_name: 'Injective',
        denom: 'uscrt'
      },
      {
        chain_name: 'Jackal',
        denom: 'uscrt'
      },
      {
        chain_name: 'Juno',
        denom: 'uscrt'
      },
      {
        chain_name: 'Kujira',
        denom: 'uscrt'
      },
      {
        chain_name: 'Noble',
        denom: 'uscrt'
      },
      {
        chain_name: 'Nolus',
        needsSkip: true,
        denom: 'uscrt'
      },
      {
        chain_name: 'Osmosis',
        denom: 'uscrt'
      },
      {
        chain_name: 'Persistence',
        denom: 'uscrt'
      },
      {
        chain_name: 'Quicksilver',
        denom: 'uscrt'
      },
      {
        chain_name: 'Sentinel',
        denom: 'uscrt'
      },
      /*       {
        chain_name: 'Sifchain',
        denom: 'uscrt',
      }, */
      {
        chain_name: 'Stargaze',
        denom: 'uscrt'
      },
      {
        chain_name: 'Stride',
        denom: 'uscrt'
      },
      {
        chain_name: 'Terra',
        denom: 'uscrt'
      }
    ]
  },
  {
    name: 'AKT',
    description: 'Akash Governance Token',
    address: 'secret168j5f78magfce5r2j4etaytyuy7ftjkh4cndqw',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/akt.svg',
    decimals: 6,
    coingecko_id: 'akash-network',
    deposits: [
      {
        chain_name: 'Akash',
        denom: 'uakt'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Akash',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Akash'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uakt'
        )
      }
    ]
  },
  {
    name: 'ANDR',
    description: 'Andromeda Governance Token',
    address: 'secret1dks96n3jz64dyulzjnjazt6cqemr0x0qgn7sd7',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/andr.png',
    decimals: 6,
    coingecko_id: 'andromeda-2',
    deposits: [
      {
        chain_name: 'Andromeda',
        denom: 'uandr'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Andromeda',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Andromeda'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uandr'
        )
      }
    ]
  },
  {
    name: 'ARCH',
    description: 'Archway Governance Token',
    address: 'secret188z7hncvphw4us4h6uy6vlq4qf20jd2vm2vu8c',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/archway.svg',
    decimals: 18,
    coingecko_id: 'archway',
    deposits: [
      {
        chain_name: 'Archway',
        denom: 'aarch'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Archway',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Archway'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'aarch'
        )
      }
    ]
  },
  {
    name: 'ATOM',
    description: 'Cosmos Hub Governance Token',
    address: 'secret19e75l25r6sa6nhdf4lggjmgpw0vmpfvsw5cnpe',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/atom.svg',
    decimals: 6,
    coingecko_id: 'cosmos',
    deposits: [
      {
        chain_name: 'Cosmos Hub',
        denom: 'uatom'
      },
      {
        chain_name: 'Osmosis',
        needsSkip: true,
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-0',
              incomingPortId: 'transfer'
            }
          ],
          'uatom'
        )
      }
    ],
    withdrawals: [
      {
        chain_name: 'Cosmos Hub',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Cosmos Hub'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uatom'
        )
      },
      {
        chain_name: 'Osmosis',
        needsSkip: true,
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Cosmos Hub'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uatom'
        )
      }
    ]
  },
  {
    name: 'BLD',
    description: 'Agoric Governance Token',
    address: 'secret1uxvpq889uxjcpj656yjjexsqa3zqm6ntkyjsjq',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/bld.svg',
    decimals: 6,
    coingecko_id: 'agoric',
    deposits: [
      {
        chain_name: 'Agoric',
        denom: 'ubld'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Agoric',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Agoric'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ubld'
        )
      }
    ]
  },
  {
    name: 'CMDX',
    description: 'Comdex Governance Token',
    address: 'secret1mndng80tqppllk0qclgcnvccf9urak08e9w2fl',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/cmdx.svg',
    decimals: 6,
    coingecko_id: 'comdex',
    deposits: [
      {
        chain_name: 'Comdex',
        denom: 'ucmdx'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Comdex',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Comdex'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ucmdx'
        )
      }
    ]
  },
  {
    name: 'CMST',
    description: 'Composite USD Stablecoin',
    address: 'secret14l7s0evqw7grxjlesn8yyuk5lexuvkwgpfdxr5',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/cmst.svg',
    decimals: 6,
    coingecko_id: 'composite',
    deposits: [
      {
        chain_name: 'Comdex',
        denom: 'ucmst'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Comdex',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Comdex'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ucmst'
        )
      }
    ]
  },
  /*  {
    name: 'CRE',
    address: 'secret1tatdlkyznf00m3a7hftw5daaq2nk38ugfphuyr',
    code_hash:
      '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/cre.svg',
    decimals: 6,
    coingecko_id: 'crescent-network',
    deposits: [
      {
        chain_name: 'Crescent',
        denom: 'ucre',
      },
    ],
    withdrawals: [
      {
        chain_name: 'Crescent',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Crescent'].withdraw_channel_id,
              incomingPortId: 'transfer',
            },
          ],
          'ucre'
        ),
      },
    ],
  }, */
  {
    name: 'DOT',
    description: 'Polkadot Governance Token',
    address: 'secret1h5d3555tz37crrgl5rppu2np2fhaugq3q8yvv9',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/dot.svg',
    decimals: 10,
    coingecko_id: 'polkadot',
    deposits: [
      {
        chain_name: 'Composable',
        denom: 'ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Composable'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'transfer/channel-2/transfer/channel-15/79228162514264337593543950342'
        )
      }
    ]
  },
  {
    name: 'DVPN',
    description: 'Sentinel Governance Token',
    address: 'secret15qtw24mpmwkjessr46dnqruq4s4tstzf74jtkf',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/dvpn.svg',
    decimals: 6,
    coingecko_id: 'sentinel',
    deposits: [
      {
        chain_name: 'Sentinel',
        denom: 'udvpn'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Sentinel',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Sentinel'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'udvpn'
        )
      }
    ]
  },
  {
    name: 'dYdX',
    description: 'dYdX governance token',
    address: 'secret13lndcagy53wfzh69rtv0dex3a7cks0dv5emwke',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/dydx.svg',
    decimals: 18,
    coingecko_id: 'dydx',
    deposits: [
      {
        chain_name: 'dYdX',
        denom: 'adydx'
      }
    ],
    withdrawals: [
      {
        chain_name: 'dYdX',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['dYdX'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'adydx'
        )
      }
    ]
  },
  {
    name: 'EVMOS',
    description: 'Evmos Governance Token',
    address: 'secret1grg9unv2ue8cf98t50ea45prce7gcrj2n232kq',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/evmos.svg',
    decimals: 18,
    coingecko_id: 'evmos',
    deposits: [
      {
        chain_name: 'Evmos',
        denom: 'aevmos'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Evmos',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Evmos'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'aevmos'
        )
      }
    ]
  },
  {
    name: 'GRAV',
    description: 'Gravity Bridge Governance Token',
    address: 'secret1dtghxvrx35nznt8es3fwxrv4qh56tvxv22z79d',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/grav.svg',
    decimals: 6,
    coingecko_id: 'graviton',
    deposits: [
      {
        chain_name: 'Gravity Bridge',
        denom: 'ugraviton'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Gravity Bridge',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Gravity Bridge'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ugraviton'
        )
      }
    ]
  },
  {
    name: 'HARBOR',
    description: 'Harbor Protocol Governance Token',
    address: 'secret1lrlkqhmwkh5y4326akn3hwn6j69f8l5656m43e',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/harbor.svg',
    decimals: 6,
    coingecko_id: 'harbor-2',
    deposits: [
      {
        chain_name: 'Comdex',
        denom: 'uharbor'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Comdex',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Comdex'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uharbor'
        )
      }
    ]
  },
  {
    name: 'HUAHUA',
    description: 'Chihuahua Governance Token',
    address: 'secret1ntvxnf5hzhzv8g87wn76ch6yswdujqlgmjh32w',
    code_hash: '182d7230c396fa8f548220ff88c34cb0291a00046df9ff2686e407c3b55692e9',
    image: '/huahua.svg',
    decimals: 6,
    coingecko_id: 'chihuahua-token',
    deposits: [
      {
        chain_name: 'Chihuahua',
        denom: 'uhuahua'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Chihuahua',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Chihuahua'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uhuahua'
        )
      }
    ]
  },
  {
    name: 'INJ',
    description: 'Injective Governance Token',
    address: 'secret14706vxakdzkz9a36872cs62vpl5qd84kpwvpew',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/inj.svg',
    decimals: 18,
    coingecko_id: 'injective-protocol',
    deposits: [
      {
        chain_name: 'Injective',
        denom: 'inj'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Injective',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Injective'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'inj'
        )
      }
    ]
  },
  {
    name: 'IST',
    description: 'Inter Protocol USD Stablecoin',
    address: 'secret1xmqsk8tnge0atzy4e079h0l2wrgz6splcq0a24',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/ist.svg',
    decimals: 6,
    coingecko_id: 'inter-stable-token',
    deposits: [
      {
        chain_name: 'Agoric',
        denom: 'uist'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Agoric',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Agoric'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uist'
        )
      }
    ]
  },
  {
    name: 'JKL',
    description: 'Jackal Governance Token',
    address: 'secret1sgaz455pmtgld6dequqayrdseq8vy2fc48n8y3',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/jkl.svg',
    decimals: 6,
    coingecko_id: 'jackal-protocol',
    deposits: [
      {
        chain_name: 'Jackal',
        denom: 'ujkl'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Jackal',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Jackal'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ujkl'
        )
      }
    ]
  },
  {
    name: 'JUNO',
    description: 'Juno Governance Token',
    address: 'secret1z6e4skg5g9w65u5sqznrmagu05xq8u6zjcdg4a',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/juno.svg',
    decimals: 6,
    coingecko_id: 'juno-network',
    deposits: [
      {
        chain_name: 'Juno',
        denom: 'ujuno'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Juno'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ujuno'
        )
      }
    ]
  },
  {
    name: 'KUJI',
    description: 'Kujira Governance Token',
    address: 'secret13hvh0rn0rcf5zr486yxlrucvwpzwqu2dsz6zu8',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/kuji.svg',
    decimals: 6,
    coingecko_id: 'kujira',
    deposits: [
      {
        chain_name: 'Kujira',
        denom: 'ukuji'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Kujira'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ukuji'
        )
      }
    ]
  },
  {
    name: 'KSM',
    description: 'Kusama Governance Token',
    address: 'secret1n4dp5dk6fufqmaalu9y7pnmk2r0hs7kc66a55f',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/ksm.svg',
    decimals: 12,
    coingecko_id: 'kusama',
    deposits: [
      {
        chain_name: 'Composable',
        denom: 'ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Composable'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'transfer/channel-2/4'
        )
      }
    ]
  },
  {
    name: 'NSTK',
    description: 'Unstake Governance Token',
    address: 'secret16l5g98d45gqvvn2g79q23h8flfq65cvr9r6c72',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/nstk.svg',
    decimals: 6,
    coingecko_id: 'unstake-fi',
    deposits: [
      {
        chain_name: 'Kujira',
        denom: 'factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Kujira'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'factory:kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh:unstk'
        )
      }
    ]
  },
  {
    name: 'LUNA',
    description: 'Terra Governance Token',
    address: 'secret149e7c5j7w24pljg6em6zj2p557fuyhg8cnk7z8',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/luna2.svg',
    decimals: 6,
    coingecko_id: 'terra-luna-2',
    deposits: [
      {
        chain_name: 'Terra',
        denom: 'uluna'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Terra',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Terra'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uluna'
        )
      }
    ]
  },
  {
    name: 'LVN',
    description: 'Levana native Token',
    address: 'secret1swrj0fqza3g98d7agm2nmukjfe44h7f5n8aavp',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/lvn.svg',
    decimals: 6,
    coingecko_id: 'levana-protocol',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: 'factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Osmosis'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn'
        )
      }
    ]
  },
  {
    name: 'milkTIA',
    description: 'MilkyWay Staked TIA',
    address: 'secret1h08ru5kul3yajg7tqj6vq9k6rccnfw2yqy8glc',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/milktia.svg',
    decimals: 6,
    coingecko_id: 'milkyway-staked-tia',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: 'factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Osmosis'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA'
        )
      }
    ]
  },
  {
    name: 'MNTA',
    description: 'Manta DAO Governance Token',
    address: 'secret15rxfz2w2tallu9gr9zjxj8wav2lnz4gl9pjccj',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/mnta.svg',
    decimals: 6,
    coingecko_id: 'mantadao',
    deposits: [
      {
        chain_name: 'Kujira',
        denom: 'factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Kujira'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'factory:kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7:umnta'
        )
      }
    ]
  },
  {
    name: 'OSMO',
    description: 'Osmosis Governance Token',
    address: 'secret150jec8mc2hzyyqak4umv6cfevelr0x9p0mjxgg',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/osmo.svg',
    decimals: 6,
    coingecko_id: 'osmosis',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: 'uosmo'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Osmosis'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uosmo'
        )
      }
    ]
  },
  {
    name: 'PAGE',
    description: 'PageDAO',
    address: 'secret1hhvfxy44e4gp6k7n4e37t7uyqa54dnp68egugg',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/page.png',
    decimals: 8,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Gravity Bridge',
        denom: 'gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Gravity Bridge',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Gravity Bridge'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e'
        )
      }
    ]
  },
  {
    name: 'PICA',
    description: 'Picasso Token',
    address: 'secret1e0y9vf4xr9wffyxsvlz35jzl5st2srkdl8frac',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/pica.svg',
    decimals: 12,
    coingecko_id: 'picasso',
    deposits: [
      {
        chain_name: 'Composable',
        denom: 'ppica'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Composable'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ppica'
        )
      }
    ]
  },
  {
    name: 'pSTAKE',
    description: 'Persistance pSTAKE',
    address: 'secret1umeg3u5y949vz6jkgq0n4rhefsr84ws3duxmnz',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/pstake.svg',
    decimals: 18,
    coingecko_id: 'pstake-finance',
    deposits: [
      {
        chain_name: 'Persistence',
        denom: 'ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Persistence',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Persistence'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006'
        )
      }
    ]
  },
  {
    name: 'qATOM',
    description: 'Quicksilver ATOM Staking Derivative',
    address: 'secret120cyurq25uvhkc7qjx7t28deuqslprxkc4rrzc',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/qatom.svg',
    decimals: 6,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Quicksilver',
        denom: 'uqatom'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Quicksilver',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Quicksilver'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uqatom'
        )
      }
    ]
  },
  {
    name: 'QCK',
    description: 'Quicksilver Governance Token',
    address: 'secret17d8c96kezszpda3r2c5dtkzlkfxw6mtu7q98ka',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/qck.svg',
    decimals: 6,
    coingecko_id: 'quicksilver',
    deposits: [
      {
        chain_name: 'Quicksilver',
        denom: 'uqck'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Quicksilver',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Quicksilver'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uqck'
        )
      }
    ]
  },
  {
    name: 'USK',
    description: 'Kujira USD Stablecoin',
    address: 'secret1cj2fvj4ap79fl9euz8kqn0k5xlvck0pw9z9xhr',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/usk.svg',
    decimals: 6,
    coingecko_id: 'kujira',
    deposits: [
      {
        chain_name: 'Kujira',
        denom: 'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Kujira'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'factory:kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7:uusk'
        )
      }
    ]
  },
  {
    name: 'USDC (Noble)',
    description: 'Native USDC Stablecoin via Noble',
    address: 'secret1chsejpk9kfj4vt9ec6xvyguw539gsdtr775us2',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/ausdc.svg',
    decimals: 6,
    coingecko_id: 'usd-coin',
    deposits: [
      {
        chain_name: 'Osmosis',
        needsSkip: true,
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-750',
              incomingPortId: 'transfer'
            }
          ],
          'uusdc'
        )
      },
      {
        chain_name: 'Noble',
        denom: 'uusdc'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        needsSkip: true,
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Noble'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uusdc'
        )
      },
      {
        chain_name: 'Noble',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Noble'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uusdc'
        )
      }
    ]
  },
  /* {
    name: 'ROWAN',
    address: 'secret159p22zvq2wzsdtqhm2plp4wg33srxp2hf0qudc',
    code_hash:
      '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/rowan.svg',
    decimals: 18,
    coingecko_id: 'sifchain',
    deposits: [
      {
        chain_name: 'Sifchain',
        denom: 'rowan',
      },
    ],
    withdrawals: [
      {
        chain_name: 'Sifchain',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Sifchain'].withdraw_channel_id,
              incomingPortId: 'transfer',
            },
          ],
          'rowan'
        ),
      },
    ],
  }, */
  {
    name: 'STARS',
    description: 'Stargaze Governance Token',
    address: 'secret1x0dqckf2khtxyrjwhlkrx9lwwmz44k24vcv2vv',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/stars.svg',
    decimals: 6,
    coingecko_id: 'stargaze',
    deposits: [
      {
        chain_name: 'Stargaze',
        denom: 'ustars'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Stargaze',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stargaze'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ustars'
        )
      }
    ]
  },
  {
    name: 'stATOM',
    description: 'Stride ATOM Staking Derivative',
    address: 'secret155w9uxruypsltvqfygh5urghd5v0zc6f9g69sq',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/statom.svg',
    decimals: 6,
    coingecko_id: 'stride-staked-atom',
    deposits: [
      /*       {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'stuatom'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'stuatom'
      }
    ],
    withdrawals: [
      /* {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuatom'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuatom'
        )
      }
    ]
  },
  {
    name: 'stINJ',
    description: 'Stride INJ Staking Derivative',
    address: 'secret1eurddal3m0tphtapad9awgzcuxwz8ptrdx7h4n',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stinj.svg',
    decimals: 18,
    coingecko_id: 'stride-staked-injective',
    deposits: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'stinj'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'stinj'
      }
    ],
    withdrawals: [
      /* {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stinj'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stinj'
        )
      }
    ]
  },
  {
    name: 'stJUNO',
    description: 'Stride JUNO Staking Derivative',
    address: 'secret1097nagcaavlkchl87xkqptww2qkwuvhdnsqs2v',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stjuno.svg',
    decimals: 6,
    coingecko_id: 'stride-staked-juno',
    deposits: [
      /* {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'stujuno'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'stujuno'
      }
    ],
    withdrawals: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stujuno'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stujuno'
        )
      }
    ]
  },
  {
    name: 'stkATOM',
    description: 'Persistance ATOM Staking Derivative',
    address: 'secret16vjfe24un4z7d3sp9vd0cmmfmz397nh2njpw3e',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stkatom.svg',
    decimals: 6,
    coingecko_id: 'stkatom',
    deposits: [
      {
        chain_name: 'Persistence',
        denom: 'stk/uatom'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Persistence',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Persistence'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stk/uatom'
        )
      }
    ]
  },
  {
    name: 'stLUNA',
    description: 'Stride LUNA Staking Derivative',
    address: 'secret1rkgvpck36v2splc203sswdr0fxhyjcng7099a9',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stluna.svg',
    decimals: 6,
    coingecko_id: 'stride-staked-luna',
    deposits: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'stuluna'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'stuluna'
      }
    ],
    withdrawals: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuluna'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuluna'
        )
      }
    ]
  },
  {
    name: 'stOSMO',
    description: 'Stride OSMO Staking Derivative',
    address: 'secret1jrp6z8v679yaq65rndsr970mhaxzgfkymvc58g',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stosmo.svg',
    decimals: 6,
    coingecko_id: 'stride-staked-osmo',
    deposits: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'stuosmo'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'stuosmo'
      }
    ],
    withdrawals: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuosmo'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'stuosmo'
        )
      }
    ]
  },
  {
    name: 'STRD',
    description: 'Stride Governance Token',
    address: 'secret1rfhgs3ryqt7makakr2qw9zsqq4h5wdqawfa2aa',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/stride.svg',
    decimals: 6,
    coingecko_id: 'stride',
    deposits: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-326',
              incomingPortId: 'transfer'
            }
          ],
          'ustrd'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: 'ustrd'
      }
    ],
    withdrawals: [
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ustrd'
        )
      }, */
      {
        chain_name: 'Stride',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Stride'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'ustrd'
        )
      }
    ]
  },
  {
    name: 'TIA',
    description: 'Celestia Governance Token',
    address: 'secret1s9h6mrp4k9gll4zfv5h78ll68hdq8ml7jrnn20',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/celestia.svg',
    decimals: 6,
    coingecko_id: 'celestia',
    deposits: [
      {
        chain_name: 'Celestia',
        denom: 'utia'
      }
      /*  {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: 'channel-6994',
              incomingPortId: 'transfer'
            }
          ],
          'utia'
        )
      } */
    ],
    withdrawals: [
      {
        chain_name: 'Celestia',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Celestia'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'utia'
        )
      }
      /* {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Celestia'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'utia'
        )
      } */
    ]
  },
  {
    name: 'WHALE',
    description: 'Migaloo Governance Token',
    address: 'secret1pcftk3ny87zm6thuxyfrtrlm2t8yev5unuvx6c',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/migaloo.svg',
    decimals: 6,
    coingecko_id: 'white-whale',
    deposits: [
      {
        chain_name: 'Migaloo',
        denom: 'uwhale'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Migaloo',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Migaloo'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uwhale'
        )
      }
    ]
  },
  {
    name: 'XPRT',
    description: 'Persistance Governance Token',
    address: 'secret1gnrrqjj5e2pwn4g262xjyypptu0ge3z3tps3nn',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/xprt.svg',
    decimals: 6,
    coingecko_id: 'persistence',
    deposits: [
      {
        chain_name: 'Persistence',
        denom: 'uxprt'
      }
    ],
    withdrawals: [
      {
        chain_name: 'Persistence',
        denom: ibcDenom(
          [
            {
              incomingChannelId: chains['Persistence'].withdraw_channel_id,
              incomingPortId: 'transfer'
            }
          ],
          'uxprt'
        )
      }
    ]
  }
]

// These are snip 20 tokens that are IBC compatible (no need to wrap them manually)
export const snips: Token[] = [
  {
    name: 'ADM',
    description: 'Admirari DAO / Secret Admirers Token',
    is_snip20: true,
    address: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
    code_hash: '6ee652c96cc3b954ea763d55b039a53784a4b15f28ccac14134c8f91e2d4c91c',
    image: '/adm.svg',
    decimals: 6,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-26', incomingPortId: 'transfer' }],
          'cw20:secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h'
        ),
        channel_id: 'channel-26',
        gas: 300_000
      },
      {
        chain_name: 'Archway',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-39', incomingPortId: 'transfer' }],
          'cw20:secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h'
        ),
        channel_id: 'channel-39',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h'
        ),
        channel_id: 'channel-476',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Archway',
        denom: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
        channel_id: 'channel-90',
        gas: 350_000
      },
      {
        chain_name: 'Composable',
        denom: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
        channel_id: 'channel-83',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        denom: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1zzuffktc25904mwus8ched6q6p5ewksy80m33h',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'ALTER',
    description: 'ALTER dApp Token',
    is_snip20: true,
    address: 'secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr',
    code_hash: '68e859db0840969e4b20b825c2cd2f41c189da83ee703746daf7a658d26f494f',
    image: '/alter.svg',
    decimals: 6,
    coingecko_id: 'alter',
    deposits: [
      {
        chain_name: 'Archway',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-39', incomingPortId: 'transfer' }],
          'cw20:secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr'
        ),
        channel_id: 'channel-39',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Archway',
        denom: 'secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr',
        channel_id: 'channel-90',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        denom: 'secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret17ljp7wwesff85ewt8xlauxjt7zrlr2hh27wgvr',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'AMBER',
    description: 'Amber DAO Token (very rare)',
    is_snip20: true,
    address: 'secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852',
    code_hash: '5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042',
    image: '/amber.jpg',
    decimals: 6,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: 'secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'BUTT',
    description: 'btn.group Token',
    is_snip20: true,
    address: 'secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt',
    code_hash: 'f8b27343ff08290827560a1ba358eece600c9ea7f403b02684ad87ae7af0f288',
    image: '/butt.png',
    decimals: 6,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: 'secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'SHD',
    description: 'Shade Protocol Governance Token',
    is_snip20: true,
    address: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/shd.svg',
    decimals: 8,
    coingecko_id: 'shade-protocol',
    deposits: [
      {
        chain_name: 'Archway',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-39', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-39',
        gas: 300_000
      },
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-26', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-26',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-476',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      },
      {
        chain_name: 'Migaloo',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-103', incomingPortId: 'transfer' }],
          'cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
        ),
        channel_id: 'channel-103',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Archway',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-90',
        gas: 350_000
      },
      {
        chain_name: 'Composable',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-83',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-45',
        gas: 350_000
      },
      {
        chain_name: 'Migaloo',
        denom: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
        channel_id: 'channel-129',
        gas: 350_000
      }
    ]
  },
  {
    name: 'SHILL',
    description: 'Shillstake Governance Token',
    is_snip20: true,
    address: 'secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse',
    code_hash: 'fe182fe93db6702b189537ea1ff6abf01b91d9b467e3d569981295497b861a1f',
    image: '/shill.svg',
    decimals: 6,
    coingecko_id: '',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: 'secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret197dvnt9yjxwn8sjdlx05f7zuk27lsdxtfnwxse',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'SIENNA',
    description: 'Sienna Network Governance Token',
    is_snip20: true,
    address: 'secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4',
    code_hash: 'c1dc8261059fee1de9f1873cd1359ccd7a6bc5623772661fa3d55332eb652084',
    image: '/sienna.jpg',
    decimals: 18,
    coingecko_id: 'sienna',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: 'secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'SILK',
    description: 'Shade Protocol Privacy-Preserving Stablecoin',
    is_snip20: true,
    address: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/silk.svg',
    decimals: 6,
    coingecko_id: 'silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2',
    deposits: [
      {
        chain_name: 'Composable',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-26', incomingPortId: 'transfer' }],
          'cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd'
        ),
        channel_id: 'channel-26',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Composable',
        denom: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
        channel_id: 'channel-83',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        denom: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  },
  {
    name: 'stkd-SCRT',
    description: 'Shade Protocol SCRT Staking Derivative',
    is_snip20: true,
    address: 'secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4',
    code_hash: 'f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09',
    image: '/stkd-scrt.svg',
    decimals: 6,
    coingecko_id: 'stkd-scrt',
    deposits: [
      {
        chain_name: 'Osmosis',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-476', incomingPortId: 'transfer' }],
          'cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4'
        ),
        channel_id: 'channel-476',
        gas: 700_000
      },
      {
        chain_name: 'Kujira',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-44', incomingPortId: 'transfer' }],
          'cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4'
        ),
        channel_id: 'channel-44',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        denom: ibcDenom(
          [{ incomingChannelId: 'channel-163', incomingPortId: 'transfer' }],
          'cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4'
        ),
        channel_id: 'channel-163',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Osmosis',
        denom: 'secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4',
        channel_id: 'channel-44',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        denom: 'secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4',
        channel_id: 'channel-46',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        denom: 'secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4',
        channel_id: 'channel-45',
        gas: 350_000
      }
    ]
  }
]

export const ICSTokens: Token[] = [
  {
    name: 'aUSDC',
    description: 'USDC stablecoin from Axelar',
    is_ics20: true,
    address: 'secret1vkq022x4q8t8kx9de3r84u669l65xnwf2lg3e6',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/ausdc.svg',
    decimals: 6,
    coingecko_id: 'usd-coin',
    axelar_denom: 'uusdc',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'uusdc',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: ibcDenom([{ incomingChannelId: 'channel-2', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-2',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'uusdc'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'AXL',
    description: 'Axelar Governance Token',
    is_ics20: true,
    address: 'secret1vcau4rkn7mvfwl8hf0dqa9p0jr59983e3qqe3z',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/axl.svg',
    decimals: 6,
    coingecko_id: 'axelar',
    axelar_denom: 'uaxl',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'uaxl',
        channel_id: 'channel-69',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aWETH',
    description: 'ETH from Axelar',
    is_ics20: true,
    address: 'secret139qfh3nmuzfgwsx2npnmnjl4hrvj3xq5rmq8a0',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/weth.svg',
    decimals: 18,
    coingecko_id: 'ethereum',
    axelar_denom: 'weth-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'weth-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: ibcDenom([{ incomingChannelId: 'channel-2', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-2',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'weth-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'awstETH',
    description: 'wstETH from Axelar',
    is_ics20: true,
    address: 'secret148jzxkagwe0xulf8jt3sw4nuh2shdh788z3gyd',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/wsteth.svg',
    decimals: 18,
    coingecko_id: 'wrapped-steth',
    axelar_denom: 'wsteth-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'wsteth-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: ibcDenom([{ incomingChannelId: 'channel-2', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-2',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'wsteth-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aWBTC',
    description: 'Wrapped Bitcoin from Axelar',
    is_ics20: true,
    address: 'secret1guyayjwg5f84daaxl7w84skd8naxvq8vz9upqx',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/wbtc.svg',
    decimals: 8,
    coingecko_id: 'bitcoin',
    axelar_denom: 'wbtc-satoshi',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'wbtc-satoshi',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: ibcDenom([{ incomingChannelId: 'channel-2', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-2',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'wbtc-satoshi'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aWBNB',
    description: 'Wrapped Binance Coin from Axelar',
    is_ics20: true,
    address: 'secret19xsac2kstky8nhgvvz257uszt44g0cu6ycd5e4',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/wbnb.svg',
    decimals: 18,
    coingecko_id: 'binancecoin',
    axelar_denom: 'wbnb-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'wbnb-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'wbnb-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'wbnb-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'wbnb-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'wbnb-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'wbnb-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aBUSD',
    description: 'Binance USD from Axelar',
    is_ics20: true,
    address: 'secret1t642ayn9rhl5q9vuh4n2jkx0gpa9r6c3sl96te',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/abusd.svg',
    decimals: 18,
    coingecko_id: 'busd',
    axelar_denom: 'busd-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'busd-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'busd-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'busd-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'busd-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'busd-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'busd-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aDAI',
    description: 'DAI from Axelar',
    is_ics20: true,
    address: 'secret1c2prkwd8e6ratk42l4vrnwz34knfju6hmp7mg7',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/adai.svg',
    decimals: 18,
    coingecko_id: 'dai',
    axelar_denom: 'dai-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'dai-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'dai-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aLINK',
    description: 'LINK from Axelar',
    is_ics20: true,
    address: 'secret1walthx26qaas50nwzg2rsqttlkf58q3hvjha5k',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/alink.svg',
    decimals: 18,
    coingecko_id: 'chainlink',
    axelar_denom: 'link-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'link-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-208',
        gas: 300_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'link-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aUNI',
    description: 'UNI from Axelar',
    is_ics20: true,
    address: 'secret1egqlkasa6xe6efmfp9562sfj07lq44z7jngu5k',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/auni.svg',
    decimals: 18,
    coingecko_id: 'uniswap',
    axelar_denom: 'uni-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'uni-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'uni-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'uni-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'uni-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'uni-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'uni-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aUSDT',
    description: 'USDT stablecoin from Axelar',
    is_ics20: true,
    address: 'secret1wk5j2cntwg2fgklf0uta3tlkvt87alfj7kepuw',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/ausdt.svg',
    decimals: 6,
    coingecko_id: 'tether',
    axelar_denom: 'uusdt',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'uusdt',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: ibcDenom([{ incomingChannelId: 'channel-7', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-7',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: ibcDenom([{ incomingChannelId: 'channel-2', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-2',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'uusdt'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Carbon',
        axelar_chain_name: CHAINS.MAINNET.CARBON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Neutron',
        axelar_chain_name: CHAINS.MAINNET.NEUTRON,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  },
  {
    name: 'aFRAX',
    description: 'FRAX from Axelar',
    is_ics20: true,
    address: 'secret16e230j6qm5u5q30pcc6qv726ae30ak6lzq0zvf',
    code_hash: '638a3e1d50175fbcb8373cf801565283e3eb23d88a9b7b7f99fcc5eb1e6b561e',
    image: '/afrax.svg',
    decimals: 18,
    coingecko_id: 'frax',
    axelar_denom: 'frax-wei',
    deposits: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'frax-wei',
        channel_id: 'channel-69',
        gas: 300_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: ibcDenom([{ incomingChannelId: 'channel-71', incomingPortId: 'transfer' }], 'frax-wei'),
        channel_id: 'channel-71',
        gas: 300_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-9', incomingPortId: 'transfer' }], 'frax-wei'),
        channel_id: 'channel-9',
        gas: 300_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: ibcDenom([{ incomingChannelId: 'channel-208', incomingPortId: 'transfer' }], 'frax-wei'),
        channel_id: 'channel-208',
        gas: 700_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: ibcDenom([{ incomingChannelId: 'channel-50', incomingPortId: 'transfer' }], 'frax-wei'),
        channel_id: 'channel-50',
        gas: 300_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: ibcDenom([{ incomingChannelId: 'channel-6', incomingPortId: 'transfer' }], 'frax-wei'),
        channel_id: 'channel-6',
        gas: 300_000
      }
    ],
    withdrawals: [
      {
        chain_name: 'Axelar',
        axelar_chain_name: CHAINS.MAINNET.AXELAR,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Juno',
        axelar_chain_name: CHAINS.MAINNET.JUNO,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Kujira',
        axelar_chain_name: CHAINS.MAINNET.KUJIRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Osmosis',
        axelar_chain_name: CHAINS.MAINNET.OSMOSIS,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Stargaze',
        axelar_chain_name: CHAINS.MAINNET.STARGAZE,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      },
      {
        chain_name: 'Terra',
        axelar_chain_name: CHAINS.MAINNET.TERRA,
        denom: 'secret1yxjmepvyl2c25vnt53cr2dpn8amknwausxee83',
        channel_id: 'channel-61',
        gas: 350_000
      }
    ]
  }
]

export const SECRET_CHAIN_ID = chains['Secret Network'].chain_id
export const SECRET_LCD = chains['Secret Network'].lcd
