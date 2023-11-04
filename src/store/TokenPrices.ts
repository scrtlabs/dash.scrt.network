import BigNumber from 'bignumber.js'
import { Nullable } from 'types/Nullable'
import { allTokens, formatUsdString } from 'utils/commons'
import { Token, tokens } from 'utils/config'
import { create } from 'zustand'

export interface CoinPrice {
  coingecko_id: string
  priceUsd: number
}

interface TokenPricesState {
  priceMapping: Map<Token, number>
  init: () => void
  isInitialized: boolean
  getPrice: (token: Token, amount?: BigNumber) => Nullable<string>
}

export const useTokenPricesStore = create<TokenPricesState>()((set, get) => ({
  priceMapping: new Map<Token, number>(),
  isInitialized: false,
  init: () => {
    let coinGeckoIdsString: string = ''
    let prices: CoinPrice[]

    allTokens.forEach((token, index) => {
      coinGeckoIdsString = coinGeckoIdsString.concat(token.coingecko_id)
      if (index !== tokens.length - 1) {
        coinGeckoIdsString = coinGeckoIdsString.concat(',')
      }
    })

    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdsString}&vs_currencies=USD`)
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        const formattedPrices = Object.entries(result).map(([coingecko_id, { usd }]) => ({
          coingecko_id,
          priceUsd: usd
        }))
        prices = formattedPrices

        const priceMapping = new Map<Token, number>()
        tokens.forEach((token: Token) => {
          priceMapping.set(token, prices.find((price: any) => price.coingecko_id === token.coingecko_id).priceUsd)
        })

        set({
          priceMapping: priceMapping,
          isInitialized: true
        })
      })
  },
  getPrice: (token: Token, amount: BigNumber = new BigNumber(1)) => {
    if (!get().isInitialized) {
      get().init()
    }
    const tokenPrice = get().priceMapping.get(token)
    if (tokenPrice !== undefined) {
      const result = new BigNumber(tokenPrice).multipliedBy(amount)
      return formatUsdString(Number(result))
    }
    return null
  }
}))
