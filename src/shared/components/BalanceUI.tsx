import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { viewingKeyErrorString, usdString } from 'shared/utils/commons'
import Tooltip from '@mui/material/Tooltip'
import { Token } from 'shared/utils/config'
import { faKey, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

export function NativeTokenBalanceUi(
  nativeBalance: any,
  selectedToken: Token,
  selectedTokenPrice: any,
  disableAvailable: boolean = false
) {
  const { secretNetworkClient, setViewingKey } = useSecretNetworkClientStore()

  if (secretNetworkClient?.address && nativeBalance !== undefined) {
    return (
      <>
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="">
          {` ${new BigNumber(nativeBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .toFormat()} ${selectedToken.name} ${
            selectedToken.coingecko_id && selectedTokenPrice
              ? ` (${usdString.format(
                  new BigNumber(nativeBalance!)
                    .dividedBy(`1e${selectedToken.decimals}`)
                    .multipliedBy(Number(selectedTokenPrice))
                    .toNumber()
                )})`
              : ''
          }`}
        </span>
      </>
    )
  } else if (secretNetworkClient?.address && nativeBalance === undefined) {
    return (
      <div className="flex items-center">
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
      </div>
    )
  } else {
    return <></>
  }
}

export function WrappedTokenBalanceUi(
  tokenBalance: any,
  selectedToken: Token,
  selectedTokenPrice: any,
  disableAvailable: boolean = false
) {
  const { secretNetworkClient, setViewingKey } = useSecretNetworkClientStore()

  if (tokenBalance === viewingKeyErrorString) {
    return (
      <>
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <button
          className="text-sm ml-2 font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40"
          onClick={() => setViewingKey(selectedToken)}
        >
          <FontAwesomeIcon icon={faKey} className="mr-2" />
          Set Viewing Key
        </button>
        <Tooltip
          title={
            'Balances on Secret Network are private by default. Create a viewing key to view your encrypted balances.'
          }
          placement="right"
          arrow
        >
          <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faInfoCircle} />
          </span>
        </Tooltip>
      </>
    )
  } else if (Number(tokenBalance) > -1) {
    return (
      <>
        {/* Available: 0.123456 sSCRT () */}
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="">
          {` ${new BigNumber(tokenBalance!)
            .dividedBy(`1e${selectedToken.decimals}`)
            .toFormat()} ${selectedToken.is_snip20 ? '' : 's'}${
            selectedToken.name
          } ${
            selectedToken.coingecko_id && selectedTokenPrice
              ? ` (${usdString.format(
                  new BigNumber(tokenBalance!)
                    .dividedBy(`1e${selectedToken.decimals}`)
                    .multipliedBy(Number(selectedTokenPrice))
                    .toNumber()
                )})`
              : ''
          }`}
        </span>
      </>
    )
  } else if (secretNetworkClient?.address && tokenBalance === undefined) {
    return (
      <div className="flex items-center">
        {!disableAvailable && <span className="font-semibold">Available:</span>}
        <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded w-20 h-5 ml-2"></span>
      </div>
    )
  } else {
    return <></>
  }
}
