import { useContext, useEffect, useRef, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faDesktop, faMobileScreen, faWallet, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useHoverOutside } from 'utils/useHoverOutside'
import { APIContext } from 'context/APIContext'
import { trackMixPanelEvent } from 'utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import { ConnectWalletModal } from 'context/ConnectWalletModal'
import Modal from '../UI/Modal/Modal'
import { ManageBalances } from './ManageBalances/ManageBalances'
import Button from '../UI/Button/Button'
import BalanceUI from 'components/BalanceUI'
import { NotificationService } from 'services/notification.service'
import { WalletService } from 'services/wallet.service'

function Wallet() {
  const {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isGetWalletModalOpen,
    setIsGetWalletModalOpen,
    isConnectWalletModalOpen,
    setIsConnectWalletModalOpen
  } = useSecretNetworkClientStore()

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false)

  useEffect(() => {
    WalletService.handleConnectWallet(setIsConnectWalletModalOpen, setIsGetWalletModalOpen)
  }, [])

  const handleManageViewingKeys = () => {
    setIsManageViewingkeysModalOpen(true)
  }

  useEffect(() => {
    let isAutoConnectEnabled = localStorage.getItem('autoConnect') === 'true'
    if (isAutoConnectEnabled) {
      WalletService.handleConnectWallet(setIsConnectWalletModalOpen, setIsGetWalletModalOpen)
    }
  }, [])

  const keplrRef = useRef()
  useHoverOutside(keplrRef, () => setIsMenuVisible(false))

  function CopyableAddress() {
    return (
      <CopyToClipboard
        text={walletAddress as string}
        onCopy={() => {
          NotificationService.notify('Address copied to clipboard!', 'success')
        }}
      >
        <Button size="small" color="secondary" className="flex gap-2 items-center group">
          {walletAddress.slice(0, 14) + '...' + walletAddress.slice(-14)}
          <FontAwesomeIcon icon={faCopy} />
        </Button>
      </CopyToClipboard>
    )
  }

  function Balances() {
    return (
      <div>
        <div className="font-bold mb-2">Your Balances</div>
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <img src={'/img/assets' + scrtToken.image} alt={scrtToken.name + ' logo'} className="h-7" />
            <BalanceUI token={scrtToken} isSecretToken={false} showBalanceLabel={false} />
          </div>
          <div className="flex items-center gap-2">
            <img src={'/img/assets' + scrtToken.image} alt={scrtToken.name + ' logo'} className="h-7" />
            <BalanceUI token={scrtToken} isSecretToken={true} showBalanceLabel={false} />
          </div>
        </div>
        <Button className="w-full" size="small" color="secondary" onClick={handleManageViewingKeys}>
          Manage All Balances
        </Button>
      </div>
    )
  }

  function ContextMenu() {
    return (
      <div className="absolute pt-10 right-4 z-40 top-[3.7rem]">
        <div className="bg-white dark:bg-neutral-800 border text-xs border-neutral-200 dark:border-neutral-700 p-4 w-auto rounded-lg flex-row space-y-4">
          {/* Copyable Wallet Address */}
          <CopyableAddress />

          {/* Balances */}
          <Balances />

          {/* Disconnect Button */}
          <Button onClick={disconnectWallet} color="red" size="small" className="w-full">
            Disconnect Wallet
          </Button>
        </div>
      </div>
    )
  }

  function GreenAnimatedDot() {
    return (
      <span className="flex relative h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    )
  }

  const [isManageViewingkeysModalOpen, setIsManageViewingkeysModalOpen] = useState<boolean>(false)

  return (
    <>
      <Modal
        isOpen={isManageViewingkeysModalOpen}
        size={'lg'}
        title={`Your Balances`}
        onClose={() => setIsManageViewingkeysModalOpen(false)}
      >
        <ManageBalances />
      </Modal>

      <ConnectWalletModal
        open={isConnectWalletModalOpen}
        onClose={() => {
          setIsConnectWalletModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      />

      <Modal
        title={'Get Wallet'}
        subTitle={'Install a wallet to interact with the applications!'}
        isOpen={isGetWalletModalOpen}
        onClose={() => {
          trackMixPanelEvent('Closed Get Wallet Modal')
          setIsGetWalletModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      >
        {/* Body */}
        <div className="flex flex-col bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
          <a
            href="https://starshell.net"
            target="_blank"
            className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Starshell Wallet on Get Wallet Modal')
            }}
          >
            <img src="/img/assets/starshell.svg" className="flex-initial w-7 h-7" />
            <span className="flex-1 font-medium flex items-center">
              Starshell{' '}
              <span className="text-xs ml-2 font-semibold py-0.5 px-1.5 rounded bg-gradient-to-r from-cyan-600 to-purple-600">
                recommended
              </span>
            </span>
            <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
              <FontAwesomeIcon icon={faDesktop} className="mr-1" />
              Desktop / <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
              Mobile
            </span>
          </a>
          <a
            href="https://www.leapwallet.io"
            target="_blank"
            className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Leap Wallet on Get Wallet Modal')
            }}
          >
            <img src="/img/assets/leap.svg" className="flex-initial w-7 h-7" />
            <span className="flex-1 font-medium">Leap</span>
            <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
              <FontAwesomeIcon icon={faDesktop} className="mr-1" />
              Desktop / <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
              Mobile
            </span>
          </a>
          <a
            href="https://fina.cash/wallet"
            target="_blank"
            className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Fina Wallet on Get Wallet Modal')
            }}
          >
            <img src="/img/assets/fina.webp" className="flex-initial w-7 h-7" />
            <span className="flex-1 font-medium">Fina</span>
            <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
              <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
              Mobile
            </span>
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en"
            target="_blank"
            className="group p-5 flex items-center gap-2.5 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Keplr Wallet on Get Wallet Modal')
            }}
          >
            <img src="/img/assets/keplr.svg" className="flex-initial w-7 h-7" />
            <span className="flex-1 font-medium">Keplr</span>
            <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
              <FontAwesomeIcon icon={faDesktop} className="mr-1" />
              Desktop
            </span>
          </a>
        </div>
      </Modal>

      {isConnected ? (
        <div ref={keplrRef}>
          {isMenuVisible && <ContextMenu />}
          <div
            className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 select-none cursor-pointer transition-colors"
            onMouseOver={() => setIsMenuVisible(true)}
            ref={keplrRef}
          >
            <div className="flex items-center font-semibold text-sm">
              <div className="flex items-center">
                <GreenAnimatedDot />
                <FontAwesomeIcon icon={faWallet} className="ml-3 mr-2" />
                {`My Wallet`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          id="keplr-button"
          onClick={() => WalletService.handleConnectWallet(setIsConnectWalletModalOpen, setIsGetWalletModalOpen)}
          className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 select-none cursor-pointer transition-colors"
        >
          <div className="flex items-center font-semibold text-sm">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faWallet} className="mr-2" />
              {`Connect Wallet`}
            </div>
          </div>
        </button>
      )}
    </>
  )
}
export default Wallet
