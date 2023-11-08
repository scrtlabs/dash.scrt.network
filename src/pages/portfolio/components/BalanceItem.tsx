import { useEffect, useState, useContext } from 'react'
import { randomDelay, sleep, formatUsdString, viewingKeyErrorString, allTokens } from 'utils/commons'
import { APIContext } from 'context/APIContext'
import { Token } from 'utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useTokenPricesStore } from 'store/TokenPrices'
import { WalletService } from 'services/wallet.service'
import BalanceUI from 'components/BalanceUI'

interface Props {
  token?: Token
}

const BalanceItem = (props: Props) => {
  const { secretNetworkClient } = useSecretNetworkClientStore()
  const { getPrice } = useTokenPricesStore()

  const assetPrice = getPrice(allTokens.find((token: Token) => token.name === props.token.name))

  const tokenName = (props.token?.address === 'native' || props.token?.is_snip20 ? '' : 's') + props.token?.name

  const tokenDescription =
    (props.token?.address !== 'native' || props.token?.is_ics20 || props.token?.is_snip20 ? 'Private ' : 'Public ') +
    props.token?.description

  return (
    <>
      <div className="first-of-type:rounded-t-lg last-of-type:rounded-b-lg group flex flex-col sm:flex-row items-center text-center sm:text-left even:bg-white odd:bg-neutral-200 dark:even:bg-neutral-800 dark:odd:bg-neutral-700 py-8 sm:py-4 gap-4 pl-4 pr-8  w-full min-w-full ">
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
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{tokenDescription}</div>
            ) : null}
          </span>
        </div>

        {props.token?.coingecko_id !== '' && (
          <div className="flex flex-col items-center">
            <div className="description text-xs text-neutral-500 dark:text-neutral-400 mb-2">Price</div>
            {assetPrice ? (
              <div className="font-semibold">{assetPrice}</div>
            ) : (
              <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
            )}
          </div>
        )}
        {secretNetworkClient?.address ? (
          <div className="flex-initial min-w-[11rem] flex flex-col items-center">
            <div className="description text-xs text-neutral-500 dark:text-neutral-400 mb-2">Balance</div>
            <div className="text-xs">
              <BalanceUI
                token={allTokens.find((token: Token) => token.name === props.token.name)}
                isSecretToken={props.token?.address !== 'native'}
                showBalanceLabel={false}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default BalanceItem
