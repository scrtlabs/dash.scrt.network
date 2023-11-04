import { Nullable } from 'types/Nullable'
import { Token } from 'utils/config'

export interface TokenPricesState {
  priceMapping: Map<Token, number>
  init: () => void
  isInitialized: boolean
  getPrice: (token: Token, amount?: number) => Nullable<string>
}
