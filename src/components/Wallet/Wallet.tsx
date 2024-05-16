import { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightFromBracket,
  faCopy,
  faDesktop,
  faGear,
  faMobileScreen,
  faWallet,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import { trackMixPanelEvent } from 'utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { scrtToken } from 'utils/tokens'
import { ConnectWalletModal } from 'context/ConnectWalletModal'
import Modal from '../UI/Modal/Modal'
import { ManageBalances } from './ManageBalances/ManageBalances'
import Button from '../UI/Button/Button'
import BalanceUI from 'components/BalanceUI'
import { NotificationService } from 'services/notification.service'
import {
  autoUpdate,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  offset,
  flip,
  shift,
  useHover,
  safePolygon
} from '@floating-ui/react'
import Badge from 'components/UI/Badge/Badge'
import StatusDot from './StatusDot'

function Wallet() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isMenuOpen,
    onOpenChange: setIsMenuOpen,
    placement: 'bottom-end', // Adjust this based on your desired position
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate
  })

  const hover = useHover(context, {
    handleClose: safePolygon({
      requireIntent: true
    })
  })
  const dismiss = useDismiss(context)
  const role = useRole(context)

  const { getFloatingProps } = useInteractions([hover, dismiss, role])

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

  const handleManageViewingKeys = () => {
    setIsManageViewingkeysModalOpen(true)
  }

  useEffect(() => {
    let isAutoConnectEnabled = localStorage.getItem('autoConnect') === 'true'
    if (isAutoConnectEnabled) {
      handleConnectWallet()
    }
  }, [])

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
      <div className="shadow backdrop-blur-md bg-white/40 dark:bg-neutral-800/40 border text-xs border-neutral-200 dark:border-neutral-700 px-4 py-6 w-auto rounded-2xl flex-row space-y-4">
        {/* Copyable Wallet Address */}
        <CopyableAddress />

        {/* Balances */}
        <Balances />

        <hr className="h-px my-8 bg-neutral-200 border-0 dark:bg-neutral-700" />

        {/* Disconnect Button */}
        <Button onClick={disconnectWallet} color="red" size="small" className="w-full">
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    )
  }

  const [isManageViewingkeysModalOpen, setIsManageViewingkeysModalOpen] = useState<boolean>(false)

  function handleConnectWallet() {
    if (window.keplr && window.getEnigmaUtils && window.getOfflineSignerAuto && window.leap) {
      setIsConnectWalletModalOpen(true)
    } else if (window.keplr && window.getEnigmaUtils && window.getOfflineSignerAuto && !window.leap) {
      connectWallet('keplr')
    } else if (!(window.keplr && window.getEnigmaUtils && window.getOfflineSignerAuto) && window.leap) {
      connectWallet('leap')
    } else {
      setIsGetWalletModalOpen(true)
    }
  }

  function X() {
    return (
      <div className="w-full sm:w-auto rounded-lg px-4 py-3 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 select-none cursor-pointer transition-colors">
        <div className="flex items-center font-semibold text-sm">
          <div className="flex items-center">
            <StatusDot status={isConnected ? 'connected' : 'disconnected'} />
            <FontAwesomeIcon icon={faWallet} className="ml-3 mr-3" />
            Wallet
          </div>
        </div>
      </div>
    )
  }

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
            <span className="flex-1 font-medium flex items-center gap-2">
              Starshell
              <Badge pill color="green">
                Recommended
              </Badge>
            </span>
            <span className="text-white dark:text-white bg-blue-500 dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors px-3 py-1.5 rounded text-xs font-semibold">
              <FontAwesomeIcon icon={faDesktop} className="mr-1" />
              Desktop / <FontAwesomeIcon icon={faMobileScreen} className="mr-1" />
              Mobile
            </span>
          </a>
          <a
            href="https://leapwallet.io/download"
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
            href="https://fina.cash/wallet#download"
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
            href="https://www.keplr.app/download"
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
        <div onClick={() => setIsMenuOpen(true)} ref={refs.setReference}>
          {isMenuOpen && (
            <div
              className="w-full sm:w-auto px-4 sm:px-0 z-40"
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <ContextMenu />
            </div>
          )}
          <div>
            <X />
          </div>
        </div>
      ) : (
        <button onClick={() => handleConnectWallet()}>
          <X />
        </button>
      )}
    </>
  )
}
export default Wallet
