import CopyToClipboard from 'react-copy-to-clipboard'
import { Chain } from 'utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Tooltip from '@mui/material/Tooltip'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IProps {
  srcChain?: Chain
  srcAddress?: string
  destChain?: Chain
  destAddress?: string
}

export default function AddressInfo(props: IProps) {
  const { isConnected } = useSecretNetworkClientStore()

  const dataMissing = !props.srcChain || !props.srcAddress || !props.destChain || !props.destChain

  // e.g. https://www.mintscan.io/secret/account/[address]
  const srcChainExplorerUrl: string = `${props.srcChain?.explorer_account}${props.srcAddress}`
  const destChainExplorerUrl: string = `${props.destChain?.explorer_account}${props.destAddress}`

  return (
    <div className="bg-gray-200 dark:bg-neutral-700 p-4 rounded-xl space-y-6">
      <div className="flex items-center">
        <div className="font-semibold mr-4 w-10">From:</div>
        <div className="flex-1 truncate font-medium text-sm">
          {isConnected && (
            <>
              {!props.srcChain && !props.srcAddress ? (
                <div className="animate-pulse">
                  <div className="h-5 bg-white dark:bg-neutral-700 rounded"></div>
                </div>
              ) : (
                <Tooltip title={'View in Explorer'} placement="top" arrow>
                  <a href={srcChainExplorerUrl} target="_blank">
                    <div className="truncate">
                      {props.srcAddress.slice(0, 22) + '...' + props.srcAddress.slice(-22)}
                    </div>
                  </a>
                </Tooltip>
              )}
            </>
          )}
        </div>
        <div className="flex-initial ml-4">
          <CopyToClipboard text={props.destAddress}>
            <Tooltip title="Copy to Clipboard" placement="top" disableHoverListener={!isConnected || dataMissing} arrow>
              <span>
                <button
                  type="button"
                  className="text-gray-500 dark:text-neutral-400 enabled:hover:text-black dark:enabled:hover:text-white enabled:active:text-neutral-500 transition-colors"
                  disabled={!isConnected || dataMissing}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </span>
            </Tooltip>
          </CopyToClipboard>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex-initial font-semibold mr-4 w-10">To:</div>
        <div className="flex-1 truncate font-medium text-sm">
          {isConnected && (
            <>
              {!props.destChain && !props.destAddress ? (
                <div className="animate-pulse">
                  <div className="h-5 bg-white dark:bg-neutral-700 rounded"></div>
                </div>
              ) : (
                <Tooltip title={'View in Explorer'} placement="bottom" arrow>
                  <a href={destChainExplorerUrl} target="_blank">
                    <div className="truncate">
                      {props.destAddress.slice(0, 22) + '...' + props.destAddress.slice(-22)}
                    </div>
                  </a>
                </Tooltip>
              )}
            </>
          )}
        </div>
        <div className="flex-initial ml-4">
          <CopyToClipboard text={props.destAddress}>
            <Tooltip
              title="Copy to Clipboard"
              placement="bottom"
              disableHoverListener={!isConnected || dataMissing}
              arrow
            >
              <span>
                <button
                  type="button"
                  className="text-gray-500 dark:text-neutral-400 enabled:hover:text-black dark:enabled:hover:text-white enabled:active:text-neutral-500 transition-colors"
                  disabled={!isConnected || dataMissing}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </span>
            </Tooltip>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  )
}
