import BigNumber from 'bignumber.js'
import { APIContext } from 'context/APIContext'
import { useContext, useEffect, useState } from 'react'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { toCurrencyString } from 'utils/commons'
import { scrtToken } from 'utils/tokens'

function AvailableBalance() {
  const { scrtBalance } = useSecretNetworkClientStore()

  const { currency } = useUserPreferencesStore()
  const { convertCurrency } = useContext(APIContext)

  const scrtBalanceNumber = Number(scrtBalance) * 0.000001

  const { getValuePrice, priceMapping } = useTokenPricesStore()

  const [availableBalanceInCurrency, setAvailableBalanceInCurrency] = useState<string>('')

  useEffect(() => {
    if (priceMapping !== null && scrtBalanceNumber !== null) {
      const valuePrice = getValuePrice(scrtToken, BigNumber(scrtBalanceNumber))
      if (valuePrice) {
        const priceInCurrency = convertCurrency('USD', valuePrice, currency)
        if (priceInCurrency !== null) {
          setAvailableBalanceInCurrency(toCurrencyString(priceInCurrency, currency))
        }
      } else {
      }
    }
  }, [priceMapping, scrtBalanceNumber])

  return (
    <div className="flex-1">
      <div className="font-bold mb-2">Available Balance</div>
      <div className="mb-1">
        <span className="font-medium font-mono">
          {scrtBalanceNumber ? (
            <>{scrtBalanceNumber}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-24 bg-white dark:bg-neutral-800 rounded-xl"></div>
            </div>
          )}
        </span>
        <span className="text-xs font-semibold text-neutral-400"> SCRT</span>
      </div>
      <div className="text-xs text-neutral-400 font-medium font-mono">
        {availableBalanceInCurrency ? (
          <>{availableBalanceInCurrency}</>
        ) : (
          <div className="animate-pulse inline-block">
            <div className="h-5 w-12 bg-white dark:bg-neutral-800 rounded-xl"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableBalance
