import { faArrowUpRightFromSquare, faShuffle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { bridgeJsonLdSchema, bridgePageDescription, bridgePageTitle } from 'utils/commons'
import { useEffect, useState } from 'react'
import { trackMixPanelEvent } from 'utils/commons'
import SquidModal from './SquidModal'
import Title from 'components/Title'
import { useUserPreferencesStore } from 'store/UserPreferences'
import SwingModal from './SwingModal'

function Bridge() {
  useEffect(() => {
    trackMixPanelEvent('Open Bridge Tab')
  }, [])

  const { theme } = useUserPreferencesStore()
  const [isSquidModalOpen, setIsSquidModalOpen] = useState(false)
  const [isSwingModalOpen, setIsSwingModalOpen] = useState(false)
  const [isSilentModalOpen, setIsSilentModalOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>{bridgePageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={bridgePageTitle} />
        <meta name="application-name" content={bridgePageTitle} />
        <meta name="description" content={bridgePageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={bridgePageTitle} />
        <meta property="og:description" content={bridgePageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={bridgePageTitle} />
        <meta name="twitter:description" content={bridgePageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">{JSON.stringify(bridgeJsonLdSchema)}</script>
      </Helmet>
      {/* Title */}
      <div className="py-4">
        <Title title={'Bridge'} />
      </div>

      <div className="max-w-2xl mx-auto px-6 text-neutral-600 dark:text-neutral-400 leading-7 text-justify divide-y divide-gray-300 dark:divide-gray-600">
        {/* Secret Tunnel Section */}
        <div className="py-4">
          <p>
            Use the{' '}
            <a
              href="https://tunnel.scrt.network"
              target="_blank"
              rel="noopener noreferrer"
              className="pb-0.5 border-b border-neutral-400 dark:border-neutral-600 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
              onClick={() => {
                trackMixPanelEvent('Clicked Secret Tunnel link (from Bridge page)')
              }}
            >
              Secret Tunnel
            </a>{' '}
            to bridge your assets from blockchains such as Ethereum, Binance Smart Chain (BSC), and Axelar to the Secret
            Network.
          </p>
          <a
            href="https://tunnel.scrt.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white block mt-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Secret Tunnel link (from Bridge page)')
            }}
          >
            Go to Secret Tunnel
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2" />
          </a>
        </div>

        {/* Protip Section */}
        <div className="py-4">
          <p>
            <span className="select-none">
              <span className="inline-block bg-emerald-500 dark:bg-emerald-800 text-white text-xs py-0.5 px-1.5 rounded uppercase font-semibold">
                Protip
              </span>{' '}
              –{' '}
            </span>
            If you want to bridge Axelar Assets (such as USDC, USDT) from other Cosmos based chains (Osmosis, Kujira) to
            Secret, please use the IBC tab:
            <Link
              to={'/ibc'}
              className="text-white block mt-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
              onClick={() => {
                trackMixPanelEvent('Clicked IBC transfer link (from Bridge page)')
              }}
            >
              <FontAwesomeIcon icon={faShuffle} className="mr-2" />
              Go to IBC Transfers
            </Link>
          </p>
        </div>

        {/* Squid Router Section */}
        <div className="py-4">
          <p>Alternatively, use Squid Router to bridge your assets into Secret Network.</p>
          <a
            href="#"
            className="text-white block mt-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Squid Router Modal (from Bridge page)')
              setIsSquidModalOpen(true)
            }}
          >
            Use Squid Router
          </a>
        </div>

        {/* Swing Swap Section */}
        <div className="py-4">
          <p>You can also use Swing Swap to bridge your assets into Secret Network.</p>
          <a
            href="#"
            className="text-white block mt-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Swing Swap Modal (from Bridge page)')
              setIsSwingModalOpen(true)
            }}
          >
            Use Swing Swap
          </a>
        </div>

        {/* SilentSwap Section */}
        <div className="py-4">
          <p>
            SilentSwap is the official privacy cross-chain aggregator for Secret Network. It offers a fast, cheap, and
            convenient way to privately and securely swap your assets by leveraging Secret Network's confidential
            computing layer. SilentSwap obfuscates the trace between sender and receiver in an entirely noncustodial,
            trustless, and permisionless manner. It is fully compliant and allows users to trade or transfer in private,
            all abstracted in a seamless user experience.
          </p>
          <a
            href="https://app.silentswap.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white block mt-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
          >
            Go to Silent Swap
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2" />
          </a>
        </div>
      </div>

      {/* Modals should be outside the divided container to avoid being affected by divide-y */}
      <SquidModal
        open={isSquidModalOpen}
        onClose={() => {
          setIsSquidModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
        theme={theme}
      />
      <SwingModal
        open={isSwingModalOpen}
        onClose={() => {
          setIsSwingModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
        theme={theme}
        secretAddress={''}
      />
    </>
  )
}

export default Bridge
