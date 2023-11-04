import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { APIContext } from 'context/APIContext'
import { viewingKeyErrorString, usdString } from 'utils/commons'
import Tooltip from '@mui/material/Tooltip'
import { Token } from 'utils/config'
import { faKey, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'

type IBalanceProps = {
  token: Token
  isSecretToken?: boolean
}

const BalanceItem: FunctionComponent<IBalanceProps> = ({
  isSecretToken = false,
  token
}) => {
  const { scrtBalance, sScrtBalance, setViewingKey } =
    useSecretNetworkClientStore()

  const { currentPrice } = useContext(APIContext)

  const SetViewingKeyButton = (props: { token: Token }) => {
    return (
      <>
        <button
          onClick={() => setViewingKey(props.token)}
          className="font-semibold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 focus:bg-neutral-500 dark:focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-100 dark:disabled:hover:bg-neutral-900 disabled:cursor-default"
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
  }

  //  e.g. "$1.23"
  const scrtBalanceUsdString = usdString.format(
    new BigNumber(scrtBalance!)
      .dividedBy(`1e${scrtToken.decimals}`)
      .multipliedBy(Number(currentPrice))
      .toNumber()
  )

  //  e.g. "$1.23"
  const sScrtBalanceUsdString = usdString.format(
    new BigNumber(sScrtBalance!)
      .dividedBy(`1e${scrtToken.decimals}`)
      .multipliedBy(Number(currentPrice))
      .toNumber()
  )

  const viewingkeyMissing =
    isSecretToken &&
    (sScrtBalance === viewingKeyErrorString || sScrtBalance === null)
  const balanceIsNaN = new BigNumber(sScrtBalance!).toString() === 'NaN'
  const isLoading =
    (isSecretToken && !viewingkeyMissing && balanceIsNaN) ||
    (!isSecretToken && balanceIsNaN)

  if (isLoading) {
    return (
      <div role="status" className="w-full animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-full dark:bg-neutral-700 mr-2"></div>
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div>
        <img
          src={'/img/assets' + token.image}
          alt={token.name + ' logo'}
          className="h-7"
        />
      </div>
      {isSecretToken && sScrtBalance == viewingKeyErrorString ? (
        <div className="font-semibold">
          {' '}
          sSCRT
          <SetViewingKeyButton token={token} />
        </div>
      ) : (
        <div className="text-xs">
          {/* Balance as native token */}
          <div className="font-semibold">
            {!isSecretToken
              ? new BigNumber(scrtBalance!)
                  .dividedBy(`1e${scrtToken.decimals}`)
                  .toFormat()
              : new BigNumber(scrtBalance!)
                  .dividedBy(`1e${scrtToken.decimals}`)
                  .toFormat()}
            {/* Token name */}
            {' ' + (isSecretToken ? 's' : '') + token.name}
          </div>
          {/* Balance in USD */}
          {currentPrice && scrtBalance && (
            <div className="text-gray-500">
              {'≈ ' +
                (isSecretToken ? sScrtBalanceUsdString : scrtBalanceUsdString)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BalanceItem
