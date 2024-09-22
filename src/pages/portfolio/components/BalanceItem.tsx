import { allTokens } from 'utils/commons'
import { Token } from 'utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { useTokenPricesStore } from 'store/TokenPrices'
import BalanceUI from 'components/BalanceUI'

interface Props {
  token?: Token
}

const BalanceItem = (props: Props) => {
  const { secretNetworkClient } = useSecretNetworkClientStore()
  const { getPrice } = useTokenPricesStore()

  const assetPrice = getPrice(allTokens.find((token: Token) => token?.name === props.token?.name))

  const tokenName = (props.token?.address !== 'native' && props.token?.name === 'SCRT' ? 's' : '') + props.token?.name

  const tokenDescription =
    (props.token?.address !== 'native' || props.token?.is_axelar_asset || props.token?.is_snip20
      ? 'Private '
      : 'Public ') + props.token?.description

  return (
    <>
      <div className="first-of-type:rounded-t-lg last-of-type:rounded-b-lg group flex flex-row items-center text-left even:bg-gray-100 odd:bg-white dark:even:bg-neutral-900 dark:odd:bg-neutral-800 even:border-x dark:even:border-neutral-800 last-of-type:border-y even:border-white py-8 sm:py-4 gap-4 pl-4 pr-8 w-full">
        {/* Token Image and Name */}
        <div className="flex items-center w-1/4">
          <img
            src={`/img/assets/${props.token?.image}`}
            alt={`${props.token?.name} logo`}
            className="w-10 h-10 mr-2 rounded-full"
          />
          <div>
            <span className="font-semibold dark:text-white text-black">{tokenName}</span>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{tokenDescription}</div>
          </div>
        </div>

        {/* Price */}
        {props.token?.coingecko_id !== '' && (
          <div className="flex flex-col items-start w-1/6">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
            {assetPrice ? (
              <div className="text-sm font-medium font-mono">{assetPrice}</div>
            ) : (
              <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600 rounded w-20 h-5"></span>
            )}
          </div>
        )}

        {/* Balance */}
        {secretNetworkClient?.address && (
          <div className="flex flex-col items-start">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Balance</div>
            <div className="text-sm font-medium">
              <BalanceUI
                token={allTokens.find((token: Token) => token.name === props.token?.name)}
                isSecretToken={props.token?.address !== 'native'}
                showBalanceLabel={false}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center ml-auto">
          {/* Send */}
          <a
            href={assetPrice ? `/send?token=` + props.token?.name.toLowerCase() : null}
            className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white py-1.5 px-3 text-xs font-bold rounded transition-colors mr-2"
          >
            Send
          </a>
          {/* IBC */}
          <a
            href={assetPrice ? `/ibc?token=` + props.token?.name.toLowerCase() : null}
            className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white py-1.5 px-3 text-xs font-bold rounded transition-colors"
          >
            IBC
          </a>
        </div>
      </div>
    </>
  )
}

export default BalanceItem
