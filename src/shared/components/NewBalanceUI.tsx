import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { Nullable } from 'shared/types/Nullable'
import { Token } from 'shared/utils/config'
import { scrtToken } from 'shared/utils/tokens'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

interface IProps {
  token: Token
  isSecureToken?: boolean
}

export default function NewBalanceUI({
  isSecureToken: isSecureToken = false,
  ...props
}: IProps) {
  const setViewingKey = () => {
    // TODO: Do something with props.token;
  }

  const { isConnected, getBalance } = useSecretNetworkClientStore()
  const { getPrice } = useTokenPricesStore()

  const [balance, setBalance] = useState<Nullable<BigNumber>>(null)
  const usdPriceString: Nullable<string> = getPrice(props.token, balance)
  const tokenName = (isSecureToken ? 's' : '') + props.token.name

  useEffect(() => {
    // TODO: Fix balances
    // const x = getBalance(props.token, isSecureToken)
    // setBalance()
  }, [])

  if (!isConnected) return null

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="font-bold">Balance: </span>

        {balance && tokenName && usdPriceString ? (
          <span className="font-medium">
            {`${balance} ${tokenName} (${usdPriceString})`}
          </span>
        ) : null}
        {!balance || !tokenName || !usdPriceString ? (
          <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
        ) : null}

        {/* <button
          onClick={setViewingKey}
          className="text-left flex items-center font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
        >
          <FontAwesomeIcon icon={faKey} className="mr-2" />
          <span className="text-left">Set Viewing Key</span>
        </button> */}
      </div>
    </>
  )
}
