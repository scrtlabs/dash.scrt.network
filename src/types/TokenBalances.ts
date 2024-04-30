import BigNumber from 'bignumber.js'
import { Nullable } from './Nullable'
import { GetBalanceError } from './GetBalanceError'

export type TokenBalances = {
  balance: Nullable<BigNumber>
  secretBalance?: Nullable<BigNumber | GetBalanceError>
}
