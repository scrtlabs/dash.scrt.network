import { useEffect } from 'react'
import { sendPageTitle, sendPageDescription, sendJsonLdSchema } from 'utils/commons'
import Title from 'components/Title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { Helmet } from 'react-helmet-async'
import mixpanel from 'mixpanel-browser'
import { useSearchParams } from 'react-router-dom'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import SendForm from './components/SendForm'
import { Token, tokens } from 'utils/config'
import { Nullable } from 'types/Nullable'

export function Send() {
  const { connectWallet, isConnected } = useSecretNetworkClientStore()

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

  function getTokenByUrlParam(): Nullable<Token> {
    const tokenUrlParam = searchParams.get('token')

    if (!tokenUrlParam) {
      return null
    }

    const potentialToken: Nullable<Token> = tokens.find(
      (token: Token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase() || null
    )
    return potentialToken
  }

  const handleClick = () => {
    if (!isConnected) {
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

      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Title*/}
        <Title title={`Send`} className="mb-6">
          <Tooltip title={'Transfer your assets to a given address'} placement="right" arrow>
            <span className="ml-2 relative text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </Title>
        {/* Content */}
        <div
          onClick={handleClick}
          className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <SendForm />
        </div>
      </div>
    </>
  )
}
