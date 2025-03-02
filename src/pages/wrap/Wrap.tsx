import { useEffect, useState, useContext, createContext } from 'react'
import { Token, tokens } from 'utils/config'
import { wrapPageTitle, wrapPageDescription, wrapJsonLdSchema } from 'utils/commons'
import { Helmet } from 'react-helmet-async'
import FeeGrantInfoModal from './components/FeeGrantInfoModal'
import mixpanel from 'mixpanel-browser'
import { WrappingMode, isWrappingMode } from 'types/WrappingMode'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Title from 'components/Title'
import WrapForm from './components/WrapForm'
import SCRTUnwrapWarning from './components/SCRTUnwrapWarning'

export function Wrap() {
  const { getBalance } = useSecretNetworkClientStore()
  const scrtBalance = getBalance(
    tokens.find((token) => token.name === 'SCRT'),
    false
  )

  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false
      })
      mixpanel.identify('Dashboard-App')
      mixpanel.track('Open Wrap Tab')
    }
  }, [])

  const infoMsg = `Converting publicly visible tokens into its privacy-preserving equivalent Secret Token and vice versa. These tokens are not publicly visible and require a viewing key.`

  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>{wrapPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={wrapPageTitle} />
        <meta name="application-name" content={wrapPageTitle} />
        <meta name="description" content={wrapPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={wrapPageTitle} />
        <meta property="og:description" content={wrapPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={wrapPageTitle} />
        <meta name="twitter:description" content={wrapPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">{JSON.stringify(wrapJsonLdSchema)}</script>
      </Helmet>

      <FeeGrantInfoModal
        open={isFeeGrantInfoModalOpen}
        onClose={() => {
          setIsFeeGrantInfoModalOpen(false)
          document.body.classList.remove('overflow-hidden')
        }}
      />

      {/* Content */}
      <div className="container w-full max-w-5xl mx-auto px-4">
        {/* Title: Secret Wrap / Secret Unwrap */}
        <Title className="mb-6" title={`Secret Wrap`} tooltip={infoMsg} />
        {Number(scrtBalance) === 0 && scrtBalance !== null ? <SCRTUnwrapWarning /> : null}
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
          <WrapForm />
        </div>
      </div>
    </>
  )
}
