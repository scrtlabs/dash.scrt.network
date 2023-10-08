import {
  faCircleCheck,
  faShuffle,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getWalletViewingKey } from 'service/walletService'
import { IbcContext } from 'ibc/Ibc'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IbcMode } from 'shared/types/IbcMode'
import { viewingKeyErrorString } from 'shared/utils/commons'
import { Token } from 'shared/utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

interface Props {
  open: boolean
  onClose: any
  selectedToken: Token
  ibcMode: IbcMode
}

const WrapModal = (props: Props) => {
  const { isWrapModalOpen, ibcMode, selectedToken } = useContext(IbcContext)

  const { setViewingKey } = useSecretNetworkClientStore()

  const [assetViewingKey, setAssetViewingKey] = useState<any>()

  useEffect(() => {
    const updateCoinBalance = async () => {
      const key = await getWalletViewingKey(selectedToken.address)
      if (!key) {
        setAssetViewingKey(viewingKeyErrorString)
      }
    }
    updateCoinBalance()
  }, [selectedToken, assetViewingKey, isWrapModalOpen])

  if (!props.open) return null

  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
        onClick={props.onClose}
      >
        {/* Inner */}
        <div className="absolute top-[15%] w-full onEnter_fadeInDown">
          <div className="mx-auto max-w-xl px-4">
            <div
              className="bg-neutral-100 dark:bg-neutral-900 p-8 rounded-2xl"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {/* Header */}
              <div className="mb-0 text-right">
                <button
                  onClick={props.onClose}
                  className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors px-1.5 py-1 rounded-lg text-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Header */}
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-medium mb-4">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="mr-2 text-emerald-500 dark:text-emerald-500"
                  />
                  Transaction Successful
                </h2>
              </div>

              {/* Body */}
              <div className="text-center">
                {(selectedToken.is_ics20 || selectedToken.is_snip20) &&
                  ibcMode === 'deposit' &&
                  assetViewingKey === viewingKeyErrorString && (
                    <>
                      <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mb-6">
                        Set a viewing key to see your newly deposited s
                        {selectedToken.name} tokens
                      </p>
                      <button
                        onClick={() => setViewingKey(selectedToken)}
                        className="sm:max-w-[200px] w-full md:px-4 inline-block bg-cyan-500 dark:bg-cyan-600 text-cyan-100 hover:text-white hover:bg-cyan-400 dark:hover:bg-cyan-600 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                      >
                        Set viewing key
                      </button>
                    </>
                  )}{' '}
                {ibcMode === 'deposit' &&
                  !selectedToken.is_ics20 &&
                  !selectedToken.is_snip20 && (
                    <>
                      <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mb-6">
                        Now that you have (publicly visible){' '}
                        {props.selectedToken.name || 'SCRT'} in Secret Network,
                        make sure to wrap your assets into the
                        privacy-preserving equivalent s
                        {props.selectedToken.name || 'SCRT'}.
                      </p>
                      <Link
                        to={'/wrap?token=' + props.selectedToken.name}
                        className="sm:max-w-[200px] w-full md:px-4 inline-block bg-cyan-500 dark:bg-cyan-600 text-cyan-100 hover:text-white hover:bg-cyan-400 dark:hover:bg-cyan-600 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                      >
                        <FontAwesomeIcon icon={faShuffle} className="mr-2" />
                        Secret Wrap
                      </Link>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WrapModal
