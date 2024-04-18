import BigNumber from 'bignumber.js'
import { APIContext } from 'context/APIContext'
import { StakingContext } from 'pages/staking/Staking'
import { useContext, useEffect, useState } from 'react'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { Nullable } from 'types/Nullable'
import { toCurrencyString } from 'utils/commons'
import { scrtToken } from 'utils/tokens'

type Props = {
  stakedAmount?: Nullable<number>
}

function StakingAmount(props: Props) {
  const { convertCurrency } = useContext(APIContext)
  const { getValuePrice, priceMapping } = useTokenPricesStore()
  const { currency } = useUserPreferencesStore()
  const [stakedAmountInCurrency, setStakedAmountInCurrency] = useState<string>('')

  useEffect(() => {
    if (priceMapping !== null && props.stakedAmount !== null) {
      const valuePrice = getValuePrice(scrtToken, BigNumber(props.stakedAmount))
      if (valuePrice) {
        const priceInCurrency = convertCurrency('USD', valuePrice, currency)
        if (priceInCurrency !== null) {
          setStakedAmountInCurrency(toCurrencyString(priceInCurrency, currency))
        }
      } else {
      }
    }
  }, [priceMapping, props.stakedAmount])

  return (
    <div className="flex-1">
      <div className="font-bold mb-2">Staking Amount</div>
      <div className="mb-1">
        <span className="text-base font-medium font-mono">
          {props.stakedAmount ? (
            <>{`${props.stakedAmount} `}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-24 bg-white dark:bg-neutral-800 rounded-xl"></div>
            </div>
          )}
        </span>
        <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
      </div>
      <div className="text-xs text-neutral-400 font-medium font-mono">
        {false ? (
          <>{`$0.00`}</>
        ) : (
          <div className="animate-pulse inline-block">
            <div className="h-5 w-12 bg-white dark:bg-neutral-800 rounded-xl"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StakingAmount
