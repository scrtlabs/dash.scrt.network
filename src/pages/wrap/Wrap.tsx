import { useEffect, useState } from 'react'
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
import BulkWrapPage from './components/BulkWrapPage'

export function Wrap() {
  const secretToken: Token = tokens.find((token) => token.name === 'SCRT')
  const [selectedToken, setSelectedToken] = useState<Token>(secretToken)
  const [wrappingMode, setWrappingMode] = useState<WrappingMode>('wrap')
  const [isFeeGrantInfoModalOpen, setIsFeeGrantInfoModalOpen] = useState(false)
  const [showBulkWrap, setShowBulkWrap] = useState(false)

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

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const modeUrlParam = searchParams.get('mode')
  const tokenUrlParam = searchParams.get('token')

  const isValidTokenParam = () => {
    return tokens.find((token: Token) => token.name.toLowerCase() === tokenUrlParam?.toLowerCase()) ? true : false
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
      ? `Converting publicly visible ${selectedToken.name} into its privacy-preserving equivalent Secret ${selectedToken.name}. These tokens are not publicly visible and require a viewing key.`
      : `Converting privacy-preserving Secret ${selectedToken.name} into its publicly visible equivalent ${selectedToken.name}.`

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

        <meta name="twitter:title" content={wrapPageTitle} />
        <meta name="twitter:description" content={wrapPageDescription} />

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

        {/* Show a SCRT warning if balance is 0 */}
        {Number(scrtBalance) === 0 && scrtBalance !== null ? <SCRTUnwrapWarning /> : null}

        {/* Single-token form */}
        <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
          <WrapForm />
        </div>

        {/* --- Collapsible Toggle for Bulk Wrap --- */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowBulkWrap((prev) => !prev)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg"
          >
            {showBulkWrap ? 'Hide Bulk Wrap' : 'Show Bulk Wrap'}
          </button>
        </div>

        {showBulkWrap && (
          <div className="rounded-3xl mt-4 px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
            <BulkWrapPage />
          </div>
        )}
      </div>
    </>
  )
}
