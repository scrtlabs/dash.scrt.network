import { useEffect, useState, useContext, createContext } from 'react'
import { Token, tokens } from 'utils/config'
import { wrapPageTitle, wrapPageDescription, wrapJsonLdSchema } from 'utils/commons'
import { Helmet } from 'react-helmet-async'
import FeeGrantInfoModal from './components/FeeGrantInfoModal'
import mixpanel from 'mixpanel-browser'
import { useSearchParams } from 'react-router-dom'
import { WrappingMode, isWrappingMode } from 'types/WrappingMode'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Title from 'components/Title'
import WrapForm from './components/WrapForm'
import SCRTUnwrapWarning from './components/SCRTUnwrapWarning'

export function Wrap() {
  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken)
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>('wrap')

  const { scrtBalance } = useSecretNetworkClientStore()

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
  const modeUrlParam = searchParams.get('mode')
  const tokenUrlParam = searchParams.get('token')

  const isValidTokenParam = () => {
    return tokens.find((token: Token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()) ? true : false
  }

  useEffect(() => {
    if (isWrappingMode(modeUrlParam?.toLowerCase())) {
      setWrappingMode(modeUrlParam.toLowerCase() as WrappingMode)
    }
  }, [modeUrlParam])

  useEffect(() => {
    if (tokenUrlParam && isValidTokenParam()) {
      setSelectedToken(tokens.find((token: Token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()))
    }
  }, [tokenUrlParam])

  const infoMsg =
    wrappingMode === 'wrap'
      ? `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent s${selectedToken.name}. These tokens are not publicly visible and require a viewing key`
      : `Converting privacy-preserving s${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}`

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
      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Title: Secret Wrap / Secret Unwrap */}
        <Title className="mb-6" title={`Secret ${wrappingMode === 'wrap' ? 'Wrap' : 'Unwrap'}`} tooltip={infoMsg} />
        {Number(scrtBalance) === 0 && scrtBalance !== null ? <SCRTUnwrapWarning /> : null}
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
          <WrapForm />
        </div>
      </div>
    </>
  )
}
