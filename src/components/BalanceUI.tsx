import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { Nullable } from 'types/Nullable'
import { Chain, Token, chains, tokens } from 'utils/config'
import { scrtToken } from 'utils/tokens'
import { useTokenPricesStore } from 'store/TokenPrices'
import { GetBalanceError, useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Tooltip from '@mui/material/Tooltip'
import { toUsdString } from 'utils/commons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IbcService } from 'services/ibc.service'
import { WalletService } from 'services/wallet.service'

interface IProps {
  token: Token
  chain?: Chain
  isSecretToken?: boolean
  showBalanceLabel?: boolean
}

export default function BalanceUI({
  token,
  chain = chains['Secret Network'],
  isSecretToken = false,
  showBalanceLabel = true
}: IProps) {
  const {
    isConnected,
    getBalance,
    balanceMapping,
    ibcBalanceMapping,
    setViewingKey,
    getIbcBalance,
    setIbcBalanceMapping
  } = useSecretNetworkClientStore()

  const { getValuePrice, priceMapping } = useTokenPricesStore()

  const [balance, setBalance] = useState<number | string>(null)
  const [usdPriceString, setUsdPriceString] = useState<string>(null)
  const tokenName = (isSecretToken ? 's' : '') + token.name

  useEffect(() => {
    if (chain === chains['Secret Network']) {
      setBalance(null)
      const newBalance = getBalance(token, isSecretToken)
      console.debug(newBalance)
      if (newBalance !== null && newBalance instanceof BigNumber) {
        setBalance(newBalance.toNumber())
      } else if (newBalance === ('viewingKeyError' as GetBalanceError)) {
        console.debug('Viewing Key not found.')
        setBalance('viewingKeyError' as GetBalanceError)
      } else if (newBalance === ('GenericFetchError' as GetBalanceError)) {
        console.debug('Viewing Key not found.')
        setBalance('GenericFetchError' as GetBalanceError)
      } else {
        setBalance(null)
      }
    }

    if (chain !== chains['Secret Network']) {
      setBalance(null)
      const IbcBalance = getIbcBalance(chain, token)
      console.debug(IbcBalance)
      if (IbcBalance !== null && IbcBalance instanceof BigNumber) {
        setBalance(IbcBalance.toNumber())
      } else {
        setBalance(null)
        setIbcBalanceMapping(chain)
      }
    }
  }, [balanceMapping, ibcBalanceMapping, token, isSecretToken, chain])

  useEffect(() => {
    if (priceMapping !== null && balance !== null) {
      setUsdPriceString(getValuePrice(token, BigNumber(balance)))
    }
  }, [priceMapping, token, balance])

  if (!isConnected) return null

  return (
    <>
      <div className="flex items-center gap-1.5">
        {showBalanceLabel && <span className="font-bold">{`Balance: `}</span>}

        {balance === null && (
          <>
            {/* Skeleton Loader */}
            <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600 rounded w-20 h-5 ml-2"></span>
          </>
        )}
        {balance !== null &&
          balance !== ('viewingKeyError' as GetBalanceError) &&
          balance !== ('GenericFetchError' as GetBalanceError) &&
          tokenName && (
            <>
              <span className="font-medium">{` ${Number(
                BigNumber(balance).dividedBy(`1e${token.decimals}`)
              ).toLocaleString(undefined, {
                maximumFractionDigits: token.decimals
              })} ${isSecretToken && !token.is_snip20 ? 's' : ''}${token.name} ${
                token.coingecko_id && usdPriceString ? ` (${usdPriceString})` : ''
              }`}</span>
            </>
          )}

        {balance === ('viewingKeyError' as GetBalanceError) && (
          <button
            onClick={() => setViewingKey(token)}
            className="text-left flex items-center font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            <span className="text-left">Set Viewing Key</span>
          </button>
        )}
      </div>
    </>
  )
}
