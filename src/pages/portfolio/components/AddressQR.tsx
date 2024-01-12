import { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ThemeContext } from 'context/ThemeContext'
import { trackMixPanelEvent } from 'utils/commons'
import CopyToClipboard from 'react-copy-to-clipboard'
import Tooltip from '@mui/material/Tooltip'
import { QRCode } from 'react-qrcode-logo'
import { Token, chains, tokens } from 'utils/config'
import { Link } from 'react-router-dom'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { Nullable } from 'types/Nullable'
import Button from 'components/UI/Button/Button'
import { NotificationService } from 'services/notification.service'

export default function AddressQR() {
  const { theme } = useContext(ThemeContext)

  const { secretNetworkClient, walletAddress } = useSecretNetworkClientStore()

  const secretToken: Nullable<Token> = tokens.find((token) => token.name === 'SCRT')

  return (
    <div className="group text-center md:text-left">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-xl">
        <div className="flex flex-row items-center gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:items-center">
            {/* Address */}
            <div className="flex-1 text-sm text-center md:text-left">
              <div className="font-semibold mb-2 text-center md:text-left">Your Wallet Address</div>
              {secretNetworkClient && (
                <Tooltip
                  title={'Open in Mintscan'}
                  placement="bottom"
                  disableHoverListener={!secretNetworkClient}
                  arrow
                >
                  <a
                    href={`${chains['Secret Network'].explorer_account}${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block truncate text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {walletAddress}{' '}
                  </a>
                </Tooltip>
              )}
              <CopyToClipboard
                text={walletAddress}
                onCopy={() => {
                  NotificationService.notify('Address copied to clipboard!', 'success')
                }}
              >
                <Tooltip
                  title={'Copy to clipboard'}
                  placement="bottom"
                  disableHoverListener={!secretNetworkClient}
                  arrow
                >
                  <span>
                    <Button
                      size="small"
                      color="secondary"
                      type="button"
                      className="ml-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 active:text-neutral-500 transition-colors"
                      disabled={!secretNetworkClient}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </Button>
                  </span>
                </Tooltip>
              </CopyToClipboard>
            </div>

            {/* Send and Get SCRT buttons */}
            <div className="flex flex-row md:flex-col gap-4 items-center justify-center md:justify-normal">
              <Link
                to="/send"
                className="md:min-w-[10rem] px-4 py-2.5 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors rounded-xl font-semibold text-sm"
                onClick={() => {
                  trackMixPanelEvent('Clicked Send SCRT')
                }}
              >
                Send
              </Link>
              <Link
                to="/get-scrt"
                className="md:min-w-[10rem] px-4 py-2.5 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors rounded-xl font-semibold text-sm"
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
              logoImage={`/img/assets/${secretToken?.image}`}
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
