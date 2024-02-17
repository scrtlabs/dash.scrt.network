import BigNumber from 'bignumber.js'
import { Nullable } from 'types/Nullable'
import { allTokens, toCurrencyString } from 'utils/commons'
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
  getPrice: (token: Token) => Nullable<string>
  getValuePrice: (token: Token, amount: BigNumber) => Nullable<string>
}

export const useTokenPricesStore = create<TokenPricesState>()((set, get) => ({
  priceMapping: new Map<Token, number>(),
  isInitialized: false,
  init: () => {
    let prices: CoinPrice[]

    let coinGeckoIdsString: string = allTokens.map((token) => token.coingecko_id).join(',')

    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdsString}&vs_currencies=USD`)
      .then((resp) => resp.json())
      .then((result: { [coingecko_id: string]: { usd: number } }) => {
        const formattedPrices = Object.entries(result).map(([coingecko_id, { usd }]) => ({
          coingecko_id,
          priceUsd: usd
        }))
        prices = formattedPrices

        const priceMapping = new Map<Token, number>()
        allTokens.forEach((token: Token) => {
          priceMapping.set(token, prices.find((price: any) => price.coingecko_id === token.coingecko_id).priceUsd)
        })

        set({
          priceMapping: priceMapping,
          isInitialized: true
        })
      })
      .catch((error) => {
        console.error(error)
        const priceMapping = new Map<Token, number>()
        tokens.forEach((token: Token) => {
          priceMapping.set(token, undefined)
        })
        set({
          priceMapping: priceMapping,
          isInitialized: true
        })
      })
  },
  getPrice: (token: Token) => {
    if (!get().isInitialized) {
      get().init()
    }
    const tokenPrice = get().priceMapping.get(token)
    if (tokenPrice !== undefined) {
      return toCurrencyString(tokenPrice)
    }
    return null
  },
  getValuePrice: (token: Token, amount: BigNumber = new BigNumber(1)) => {
    if (!get().isInitialized) {
      get().init()
    }
    const tokenPrice = get().priceMapping.get(token)
    if (tokenPrice !== undefined) {
      const result = new BigNumber(tokenPrice).multipliedBy(amount).dividedBy(`1e${token.decimals}`)
      return toCurrencyString(Number(result))
    }
    return null
  }
}))
