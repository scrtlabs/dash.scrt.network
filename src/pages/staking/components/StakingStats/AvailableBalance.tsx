import BigNumber from 'bignumber.js'
import { APIContext } from 'context/APIContext'
import { useContext, useEffect, useState } from 'react'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { toCurrencyString } from 'utils/commons'
import { tokens } from 'utils/config'
import { scrtToken } from 'utils/tokens'

function AvailableBalance() {
  const { getBalance } = useSecretNetworkClientStore()

  const scrtBalance = getBalance(
    tokens.find((token) => token.name === 'SCRT'),
    false
  )
  console.log(scrtBalance)

  const { currency } = useUserPreferencesStore()
  const { convertCurrency } = useContext(APIContext)

  const { getValuePrice, priceMapping } = useTokenPricesStore()

  const [availableBalanceInCurrency, setAvailableBalanceInCurrency] = useState<string>('')

  useEffect(() => {
    if (priceMapping !== null && scrtBalance !== null) {
      const valuePrice = getValuePrice(scrtToken, BigNumber(scrtBalance))
      if (valuePrice) {
        const priceInCurrency = convertCurrency('USD', valuePrice, currency)
        if (priceInCurrency !== null) {
          setAvailableBalanceInCurrency(toCurrencyString(priceInCurrency, currency))
        }
      }
    }
  }, [priceMapping, scrtBalance])

  return (
    <div className="flex-1">
      <div className="font-bold mb-2">Available Balance</div>
      <div className="mb-1">
        <span className="font-medium font-mono">
          {scrtBalance !== null ? (
            <>{new BigNumber(scrtBalance).dividedBy(`1e${scrtToken.decimals}`).toNumber()}</>
          ) : (
            <div className="animate-pulse inline-block">
              <div className="h-5 w-24 bg-white dark:bg-neutral-700 rounded-xl"></div>
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
            <div className="h-5 w-12 bg-white dark:bg-neutral-700 rounded-xl"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableBalance
