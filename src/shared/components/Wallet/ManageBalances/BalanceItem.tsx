import { useEffect, useState, useContext } from 'react'
import {
  randomDelay,
  sleep,
  usdString,
  viewingKeyErrorString
} from 'shared/utils/commons'
import { APIContext } from 'shared/context/APIContext'
import { Token } from 'shared/utils/config'
import {
  NativeTokenBalanceUi,
  WrappedTokenBalanceUi
} from 'shared/components/BalanceUI'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useTokenPricesStore } from 'store/TokenPrices'
import { Nullable } from 'shared/types/Nullable'
import { WalletService } from 'shared/services/wallet.service'

interface Props {
  token?: Token
}

const BalanceItem = (props: Props) => {
  const { secretNetworkClient } = useSecretNetworkClientStore()
  const { getPrice } = useTokenPricesStore()

  const { prices } = useContext(APIContext)

  const assetPrice = getPrice(props.token)

  const tokenName =
    (props.token?.address === 'native' || props.token?.is_snip20 ? '' : 's') +
    props.token?.name

  const tokenDescription =
    (props.token?.address !== 'native' ||
    props.token?.is_ics20 ||
    props.token?.is_snip20
      ? 'Private '
      : 'Public ') + props.token?.description

  const [nativeBalance, setNativeBalance] = useState<any>(undefined)
  const [tokenBalance, setTokenBalance] = useState<any>(undefined)

  async function setBalance() {
    try {
      if (props.token?.address === 'native') {
        setNativeBalance(undefined)
        await updateCoinBalance()
      } else {
        setTokenBalance(undefined)
        await updateTokenBalance()
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!secretNetworkClient?.address) return
    ;(async () => {
      setBalance()
    })()

    const interval = setInterval(setBalance, 100000)
    return () => {
      clearInterval(interval)
    }
  }, [secretNetworkClient?.address, secretNetworkClient])

  const updateCoinBalance = async () => {
    try {
      const {
        balance: { amount }
      } = await secretNetworkClient.query.bank.balance({
        address: secretNetworkClient?.address,
        denom: props.token?.withdrawals[0]?.from_denom
      })
      setNativeBalance(amount)
    } catch (e) {
      console.error(`Error while trying to query ${props.token?.name}:`, e)
    }
  }

  const updateTokenBalance = async () => {
    if (!props.token?.address || !secretNetworkClient) {
      return
    }

    const key = await WalletService.getWalletViewingKey(props.token?.address)
    if (!key) {
      setTokenBalance(viewingKeyErrorString)
      return
    }

    try {
      await sleep(randomDelay(0, 1000))
      const result: {
        viewing_key_error: any
        balance: {
          amount: string
        }
      } = await secretNetworkClient.query.compute.queryContract({
        contract_address: props.token?.address,
        code_hash: props.token?.code_hash,
        query: {
          balance: { address: secretNetworkClient?.address, key }
        }
      })

      if (result.viewing_key_error) {
        setTokenBalance(viewingKeyErrorString)
        return
      }

      setTokenBalance(result.balance.amount)
    } catch (e) {
      console.error(`Error getting balance for s${props.token?.name}`, e)

      setTokenBalance(viewingKeyErrorString)
    }
  }

  return (
    <>
      <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left even:bg-white odd:bg-neutral-200 dark:even:bg-neutral-800 dark:odd:bg-neutral-950 py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full ">
        {/* Image */}
        <div className="relative flex items-center">
          {props.token?.image ? (
            <>
              <img
                src={`/img/assets/${props.token?.image}`}
                alt={`${props.token?.name} logo`}
                className="w-10 h-10 mr-1 rounded-full"
              />
            </>
          ) : null}
        </div>
        {/* Title */}
        <div className="flex-1">
          <span className="font-semibold dark:text-white text-black">
            {tokenName}
            {props.token?.description ? (
              <div className="text-xs text-neutral-500 dark:text-neutral-600">
                {tokenDescription}
              </div>
            ) : null}
          </span>
        </div>

        {props.token?.coingecko_id !== '' && (
          <div className="flex flex-col items-center">
            <div className="description text-xs text-neutral-500 dark:text-neutral-600 mb-2">
              Price
            </div>
            {assetPrice ? (
              <div className="font-semibold">{assetPrice}</div>
            ) : (
              <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
            )}
          </div>
        )}
        {secretNetworkClient?.address ? (
          <div className="flex flex-col items-center">
            <div className="description text-xs text-neutral-500 dark:text-neutral-600 mb-2">
              Balance
            </div>
            <div className="font-semibold">
              {/* {props.token?.address === 'native'
                ? NativeTokenBalanceUi(
                    nativeBalance,
                    props.token,
                    assetPrice,
                    true
                  )
                : WrappedTokenBalanceUi(
                    tokenBalance,
                    props.token,
                    assetPrice,
                    true
                  )} */}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default BalanceItem
