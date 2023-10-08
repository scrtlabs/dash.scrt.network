import { Nullable } from 'shared/types/Nullable'
import { Token } from 'shared/utils/config'

export interface TokenPricesState {
  priceMapping: Map<Token, number>
  init: () => void
  isInitialized: boolean
  getPrice: (token: Token, amount?: number) => Nullable<string>
}
