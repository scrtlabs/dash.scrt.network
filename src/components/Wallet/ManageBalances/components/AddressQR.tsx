import { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ThemeContext } from 'context/ThemeContext'
import { trackMixPanelEvent } from 'utils/commons'
import CopyToClipboard from 'react-copy-to-clipboard'
import { toast } from 'react-toastify'
import Tooltip from '@mui/material/Tooltip'
import { QRCode } from 'react-qrcode-logo'
import { faArrowUpRightFromSquare, faCopy } from '@fortawesome/free-solid-svg-icons'
import { Token, chains, tokens } from 'utils/config'
import { Link } from 'react-router-dom'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

export default function AddressQR() {
  const { theme, setTheme } = useContext(ThemeContext)

  const { secretNetworkClient, walletAddress } = useSecretNetworkClientStore()

  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')

  return (
    <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            {/* Address */}
            <div className="truncate font-medium text-sm mb-2">
              <div className="flex">
                <div className="flex-1 font-semibold mb-2 text-center sm:text-left">Your Address:</div>
              </div>
              {secretNetworkClient && (
                <a
                  href={`${chains['Secret Network'].explorer_account}${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {walletAddress}{' '}
                </a>
              )}
              <CopyToClipboard
                text={walletAddress}
                onCopy={() => {
                  toast.success('Address copied to clipboard!')
                }}
              >
                <Tooltip
                  title={'Copy to clipboard'}
                  placement="bottom"
                  disableHoverListener={!secretNetworkClient}
                  arrow
                >
                  <span>
                    <button
                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 active:text-neutral-500 transition-colors"
                      disabled={!secretNetworkClient}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </span>
                </Tooltip>
              </CopyToClipboard>
            </div>

            {/* Send and Get SCRT buttons */}
            <div className="flex mt-auto">
              <Link
                to="/send"
                className="flex-1 md:px-4 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                onClick={() => {
                  trackMixPanelEvent('Clicked Send SCRT')
                }}
              >
                Send
              </Link>
              <Link
                to="/get-scrt"
                className="flex-1 md:px-4 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm ml-2"
                onClick={() => {
                  trackMixPanelEvent('Clicked Get SCRT')
                }}
              >
                Get SCRT
              </Link>
            </div>
          </div>
          {/* QR Code */}
          <div className="ml-2">
            <QRCode
              value={walletAddress}
              quietZone={0}
              logoImage={`/img/assets/${secretToken.image}`}
              size={110}
              logoHeight={25}
              logoWidth={25}
              ecLevel={'L'}
              removeQrCodeBehindLogo={false}
              bgColor={theme === 'dark' ? '#262626' : '#FFFFFF'}
              fgColor={theme === 'dark' ? '#FFFFFF' : '#000000'}
              qrStyle={'dots'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
