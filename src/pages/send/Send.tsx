import { useEffect, useState, useContext } from 'react'
import { MsgExecuteContract, BroadcastMode, MsgSend, validateAddress } from 'secretjs'
import { Token } from 'utils/config'
import {
  sleep,
  faucetAddress,
  viewingKeyErrorString,
  sendPageTitle,
  sendPageDescription,
  sendJsonLdSchema,
  allTokens,
  randomPadding
} from 'utils/commons'
import Title from 'components/Title'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { Helmet } from 'react-helmet-async'
import mixpanel from 'mixpanel-browser'
import { useSearchParams } from 'react-router-dom'
import { APIContext } from 'context/APIContext'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import SendForm from './components/SendForm'
import { WalletService } from 'services/wallet.service'

export function Send() {
  const { secretNetworkClient, connectWallet } = useSecretNetworkClientStore()

  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('Open Wrap Tab')
    }
  }, [])

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const tokenUrlParam = searchParams.get('token')

  const isValidTokenParam = () => {
    return tokens.find((token: any) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()) ? true : false
  }

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(tokens.find((token: any) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()))
    }
  }, [])

  const handleClick = () => {
    if (!secretNetworkClient?.address || !secretNetworkClient) {
      connectWallet()
    }
  }

  return (
    <>
      <Helmet>
        <title>{sendPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={sendPageTitle} />
        <meta name="application-name" content={sendPageTitle} />
        <meta name="description" content={sendPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={sendPageTitle} />
        <meta property="og:description" content={sendPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={sendPageTitle} />
        <meta name="twitter:description" content={sendPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">{JSON.stringify(sendJsonLdSchema)}</script>
      </Helmet>

      {/* Content */}
      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
          {/* Title: Secret Wrap / Secret Unwrap */}
          <div className="mb-8">
            <Title title={`Send`}>
              <Tooltip title={'Transfer your assets to a given address'} placement="right" arrow>
                <span className="ml-2 relative -top-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
              </Tooltip>
            </Title>
          </div>
          <SendForm />
        </div>
      </div>
    </>
  )
}
