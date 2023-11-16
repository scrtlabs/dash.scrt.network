import { Bech32Address } from '@keplr-wallet/cosmos'
import { tokens, snips, ICSTokens } from './config'
import mixpanel from 'mixpanel-browser'

export const viewingKeyErrorString = '🧐'

export const faucetURL = 'https://faucet.secretsaturn.net/claim'
export const faucetAddress = 'secret1tq6y8waegggp4fv2fcxk3zmpsmlfadyc7lsd69'

export const dAppsURL = 'https://secretadmin.scrt.network/api/ecosystem-dapps?populate=deep&pagination[pageSize]=1000'

export const gasPriceUscrt = 0.25

export const restakeThreshold = 10_000_000

export const keplrChainRegistryUrl = 'https://keplr-chain-registry.vercel.app/api/chains'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const randomDelay = (min: any, max: any) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const allTokens = tokens.concat(snips).concat(ICSTokens)

/**
 * Generates random string of characters, used to add entropy to TX data
 * */
export const randomPadding = (): string => {
  enum length {
    MAX = 15,
    MIN = 8
  }
  const paddingLength = Math.floor(Math.random() * (length.MAX - length.MIN + 1)) + length.MIN
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < paddingLength; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function trackMixPanelEvent(event: string) {
  if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true' && event) {
    mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
      debug: false
    })
    mixpanel.identify('Dashboard-App')
    mixpanel.track(event)
    console.log(event)
  }
}

async function getChainsData() {
  try {
    const response = await (await fetch(keplrChainRegistryUrl)).json()
    return response.chains
  } catch {
    console.error('Error catching chain registry')
  }
  return null
}

export async function suggestChainToWallet(wallet: any, chainId: string) {
  const chains = await getChainsData()

  const chainInfo = chains.find((chain: any) => chain.chainId === chainId)

  if (!chainInfo) {
    console.error('Chain not found')
  }
  console.log(chainInfo)
  // Use chainInfo to suggest the chain to the wallet
  await wallet.experimentalSuggestChain(chainInfo)
}

export const getFractionDigits = (number: Number) => {
  const significantDigits = 2
  const maxFractionDigits = 6

  // Check if the number is zero
  if (number === 0) {
    return { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  }

  const strNumber = number.toFixed(maxFractionDigits)
  const [whole, decimal] = strNumber.split('.')

  if (!decimal || whole.length >= significantDigits) {
    return { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  }

  let requiredDigits = significantDigits - whole.length
  const leadingZeros = decimal.length - decimal.replace(/^0+/, '').length
  requiredDigits += leadingZeros

  let fractionDigits = Math.min(requiredDigits, maxFractionDigits)
  fractionDigits = Math.max(fractionDigits, 2)

  return {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }
}

export const toUsdString = (number: any) => {
  const fractionDigits = getFractionDigits(number)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    ...fractionDigits
  }).format(number)
}

const COUNT_ABBRS = ['', 'K', 'M', 'B', 't', 'q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T', 'Qt', 'Qd', 'Sd', 'St']

export function formatNumber(count: number, decimals = 2) {
  const i = count < 1 ? 0 : Math.floor(Math.log(count) / Math.log(1000))
  return parseFloat((count / 1000 ** i).toFixed(decimals)).toLocaleString() + COUNT_ABBRS[i]
}

export const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export const sortDAppsArray = (array: any[]) => {
  const sortedArray = [...array].sort((a, b) => a.attributes.name.localeCompare(b.attributes.name))
  return sortedArray
}

/**
 * SEO
 */

export const pageTitle = `Secret Dashboard`
export const alternatePageTitle = `Secret Dash`

// Dashboard
export const dashboardPageTitle = `Secret Dashboard`
export const dashboardAlternatePageTitle = `Secret Dash`
export const dashboardPageDescription = `Secret Dashboard is an entry point into Secret Network! Offering tools like IBC Transfer and Wrapping, Secret Dashboard leverages privacy possibilities within SCRT!`
export const dashboardJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network',
    name: dashboardPageTitle,
    alternateName: dashboardAlternatePageTitle,
    description: dashboardPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// IBC
export const ibcPageTitle = `${pageTitle} | IBC Transfer`
export const ibcPageDescription = `Deposit your assets, such as SCRT, via IBC transfer to and from Secret Network!`
export const ibcJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/ibc',
    name: `${pageTitle} | IBC Transfer`,
    alternateName: `${alternatePageTitle} | IBC Transfer`,
    description: ibcPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Wrap
export const wrapPageTitle = `${pageTitle} | Wrap`
export const wrapPageDescription = `Convert publicly visible SCRT into its privacy-preserving equivalent sSCRT with Secret Wrap! These secret tokens are not publicly visible and require a viewing key!`
export const wrapJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/wrap',
    name: `${pageTitle} | Wrap`,
    alternateName: `${alternatePageTitle} | Wrap`,
    description: wrapPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Bridge
export const bridgePageTitle = `${pageTitle} | Bridge`
export const bridgePageDescription = `Learn how to bridge your assets from blockchains such as Ethereum, Binance Smart Chain (BSC) and Axelar to Secret Network!`
export const bridgeJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/bridge',
    name: `${pageTitle} | Bridge`,
    alternateName: `${pageTitle} | Wrap`,
    description: bridgePageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Staking
export const stakingPageTitle = `${pageTitle} | Staking`
export const stakingPageDescription = `A staking panel for scrt! Delegate, undelegate, or auto-delegate your assets! Automate the process of "claim and restake" for your SCRT!`
export const stakingJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/staking',
    name: stakingPageTitle,
    description: stakingPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Portfolio
export const portfolioPageTitle = `${pageTitle} | Portfolio`
export const portfolioPageDescription = `View of all your balances on Secret Network!`
export const portfolioJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/portfolio',
    name: `${pageTitle} | Portfolio`,
    alternateName: `${alternatePageTitle} | Portfolio`,
    description: portfolioPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Send
export const sendPageTitle = `${pageTitle} | Send`
export const sendPageDescription = `Send public (SCRT) or privacy preserving tokens!`
export const sendJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/send',
    name: `${pageTitle} | Send`,
    alternateName: `${alternatePageTitle} | Send`,
    description: sendPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]

// Apps
export const appsPageTitle = `${pageTitle} | Apps`
export const appsPageDescription = `A curation of applications running on Secret Network Mainnet!`
export const appsJsonLdSchema = [
  {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: 'https://dash.scrt.network/apps',
    name: `${pageTitle} | Apps`,
    alternateName: `${alternatePageTitle} | Apps`,
    description: appsPageDescription,
    creator: 'Secret Jupiter, Secret Saturn'
  }
]
