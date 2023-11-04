import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { Nullable } from 'types/Nullable'
import { Token, tokens } from 'utils/config'
import { scrtToken } from 'utils/tokens'
import { useTokenPricesStore } from 'store/TokenPrices'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Tooltip from '@mui/material/Tooltip'

interface IProps {
  token: Token
  isSecretToken: boolean
}

export default function NewBalanceUI(props: IProps) {
  const setViewingKey = () => {
    // TODO: Do something with props.token;
  }

  const { isConnected, getBalance, balanceMapping } = useSecretNetworkClientStore()
  const { getPrice, priceMapping } = useTokenPricesStore()

  const [balance, setBalance] = useState<number>(null)
  const [usdPriceString, setUsdPriceString] = useState<string>(null)
  //const usdPriceString: Nullable<string> = getPrice(props.token)
  const tokenName = (props.isSecretToken ? 's' : '') + props.token.name

  useEffect(() => {
    if (balanceMapping != null) {
      const newBalance = getBalance(props.token, props.isSecretToken)
      if (newBalance != null || newBalance != undefined) {
        setBalance(newBalance.toNumber())
      } else {
        setBalance(undefined)
      }
    }
  }, [balanceMapping, props])

  useEffect(() => {
    if (priceMapping != null) {
      setUsdPriceString(getPrice(props.token))
    }
  }, [usdPriceString])

  if (!isConnected) return null

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="font-bold">{`Balance: `}</span>

        {balance && tokenName ? (
          <>
            <span className="font-medium">{`${balance} ${tokenName}`}</span>
            {usdPriceString ? (
              <span className="font-medium"> {usdPriceString}</span>
            ) : (
              <>
                {/* Skeleton Loader */}
                <Tooltip title={`Loading USD price...`} placement="bottom" arrow>
                  <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600 rounded w-10 h-5"></span>
                </Tooltip>
              </>
            )}
          </>
        ) : (
          <>
            {/* Skeleton Loader */}
            <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600 rounded w-20 h-5 ml-2"></span>
          </>
        )}

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
