import { faDesktop, faMobileScreen, faWallet, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

interface IConnectWalletModalProps {
  open: boolean
  onClose: any
}

export const ConnectWalletModal = (props: IConnectWalletModalProps) => {
  if (!props.open) return null

  const { connectWallet, isConnected } = useSecretNetworkClientStore()

  const isLeapAPIAvailable = window.leap ? true : false
  const isKeplrAPIAvailable = window.keplr ? true : false

  // connection? => close modal
  useEffect(() => {
    if (isConnected) {
      props.onClose()
    }
  }, [isConnected])

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50" onClick={props.onClose}>
      <div className="relative py-[6rem] w-full onEnter_fadeInDown h-full overflow-scroll scrollbar-hide">
        <div className="mx-auto max-w-xl px-4">
          <div
            className="bg-white dark:bg-neutral-900 p-8 rounded-2xl"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {/* Header */}
            <div className="mb-0 text-right">
              <button
                onClick={props.onClose}
                className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
              >
                <FontAwesomeIcon icon={faXmark} className="fa-fw" />
              </button>
            </div>
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-medium mb-2">
                <FontAwesomeIcon icon={faWallet} className="mr-2" />
                Connect to a wallet
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                Please connect to one of your wallets to access your applications
              </p>
            </div>
            <div className="flex flex-col bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
              {/* Starshell Wallet */}
              <button
                disabled={!isKeplrAPIAvailable}
                onClick={async () => {
                  connectWallet('keplr')
                }}
                className={`group text-left p-5 flex items-center gap-2.5 enabled:hover:bg-neutral-300 dark:enabled:hover:bg-neutral-700 transition-colors`}
              >
                <img src="/img/assets/starshell.svg" className="flex-initial w-7 h-7 group-disabled:grayscale" />
                <span className="flex-1 font-medium group-disabled:text-neutral-400 group-disabled:dark:text-neutral-500">
                  Starshell Wallet
                </span>
                <span className="text-white dark:text-white group-enabled:bg-blue-500 group-enabled:dark:bg-blue-500 group-enabled:group-hover:bg-blue-600 group-enabled:dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold group-disabled:bg-neutral-400 group-disabled:dark:bg-neutral-700">
                  <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                  Desktop / <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                  Mobile
                </span>
              </button>

              {/* Leap Wallet */}
              <button
                disabled={!isLeapAPIAvailable}
                onClick={() => {
                  connectWallet('leap')
                }}
                className={`group text-left p-5 flex items-center gap-2.5 enabled:hover:bg-neutral-300 dark:enabled:hover:bg-neutral-700 transition-colors`}
              >
                <img src="/img/assets/leap.svg" className="flex-initial w-7 h-7 group-disabled:grayscale" />
                <span className="flex-1 font-medium group-disabled:text-neutral-400 group-disabled:dark:text-neutral-500">
                  Leap Wallet
                </span>
                <span className="text-white dark:text-white group-enabled:bg-blue-500 group-enabled:dark:bg-blue-500 group-enabled:group-hover:bg-blue-600 group-enabled:dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold group-disabled:bg-neutral-400 group-disabled:dark:bg-neutral-700">
                  <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                  Desktop / <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                  Mobile
                </span>
              </button>

              {/* Fina Wallet */}
              <button
                disabled={!isKeplrAPIAvailable}
                onClick={async () => {
                  connectWallet('keplr')
                }}
                className={`group text-left p-5 flex items-center gap-2.5 enabled:hover:bg-neutral-300 dark:enabled:hover:bg-neutral-700 transition-colors`}
              >
                <img src="/img/assets/fina.webp" className="flex-initial w-7 h-7 group-disabled:grayscale" />
                <span className="flex-1 font-medium group-disabled:text-neutral-400 group-disabled:dark:text-neutral-500">
                  Fina Wallet
                </span>
                <span className="text-white dark:text-white group-enabled:bg-blue-500 group-enabled:dark:bg-blue-500 group-enabled:group-hover:bg-blue-600 group-enabled:dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold group-disabled:bg-neutral-400 group-disabled:dark:bg-neutral-700">
                  <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
                  Mobile
                </span>
              </button>

              {/* Keplr Wallet */}
              <button
                disabled={!isKeplrAPIAvailable}
                onClick={async () => {
                  connectWallet('keplr')
                }}
                className={`group text-left p-5 flex items-center gap-2.5 enabled:hover:bg-neutral-300 dark:enabled:hover:bg-neutral-700 transition-colors`}
              >
                <img src="/img/assets/keplr.svg" className="flex-initial w-7 h-7 group-disabled:grayscale" />
                <span className="flex-1 font-medium group-disabled:text-neutral-400 group-disabled:dark:text-neutral-500">
                  Keplr Wallet
                </span>
                <span className="text-white dark:text-white group-enabled:bg-blue-500 group-enabled:dark:bg-blue-500 group-enabled:group-hover:bg-blue-600 group-enabled:dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold group-disabled:bg-neutral-400 group-disabled:dark:bg-neutral-700">
                  <FontAwesomeIcon icon={faDesktop} className="mr-1" />
                  Desktop
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
