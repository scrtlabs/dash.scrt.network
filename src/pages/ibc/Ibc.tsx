import { useState, useEffect, createContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Tooltip from '@mui/material/Tooltip'
import { Helmet } from 'react-helmet-async'
import { Token, tokens } from 'utils/config'
import { IbcMode } from 'types/IbcMode'
import { useSearchParams } from 'react-router-dom'
import { ibcJsonLdSchema, ibcPageDescription, ibcPageTitle } from 'utils/commons'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Title from 'components/Title'
import IbcForm from './components/IbcForm'

export const IbcContext = createContext(null)

export function Ibc() {
  const [isWrapModalOpen, setIsWrapModalOpen] = useState<boolean>(false)

  const [selectedToken, setSelectedToken] = useState<Token>(tokens.filter((token: Token) => token.name === 'SCRT')[0])

  const [supportedTokens, setSupportedTokens] = useState<Token[]>([])

  const [ibcMode, setIbcMode] = useState<IbcMode>('deposit')

  const { isConnected, connectWallet } = useSecretNetworkClientStore()

  // URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const modeUrlParam: string = searchParams.get('mode')
  const chainUrlParam: string = searchParams.get('chain')
  const tokenUrlParam: string = searchParams.get('token')

  const selectableChains = tokens.find((token) => token.name === 'SCRT').deposits

  const [selectedSource, setSelectedSource] = useState(
    selectedToken.deposits.find((deposit: any) => deposit.chain_name.toLowerCase() === 'osmosis')
  )

  const isValidChainUrlParam = () => {
    return selectedToken.deposits.find(
      (deposit: any) => deposit.chain_name.toLowerCase() === chainUrlParam.toLowerCase()
    )
      ? true
      : false
  }

  const isValidTokenUrlParam = () => {
    return true
  }

  useEffect(() => {
    if (modeUrlParam?.toLowerCase() === 'deposit' || modeUrlParam?.toLowerCase() === 'withdrawal') {
      setIbcMode(modeUrlParam.toLowerCase() as IbcMode)
    }
  }, [])

  useEffect(() => {
    if (chainUrlParam && isValidChainUrlParam()) {
      setSelectedSource(
        selectedToken.deposits.find((deposit: any) => deposit.chain_name.toLowerCase() === chainUrlParam.toLowerCase())
      )
    }
    if (tokenUrlParam && isValidTokenUrlParam()) {
      setSelectedToken(tokens.find((token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()))
    }
  }, [])

  useEffect(() => {
    var params = {}
    if (ibcMode) {
      params = { ...params, mode: ibcMode.toLowerCase() }
    }
    if (selectedSource) {
      params = { ...params, chain: selectedSource.chain_name.toLowerCase() }
    }
    setSearchParams(params)
  }, [ibcMode, selectedSource])

  function toggleIbcMode() {
    if (ibcMode === 'deposit') {
      setIbcMode('withdrawal')
    } else {
      setIbcMode('deposit')
    }
  }

  const handleClick = () => {
    if (!isConnected) {
      connectWallet()
    }
  }

  const ibcContextProviderValue = {
    isWrapModalOpen,
    setIsWrapModalOpen,
    ibcMode,
    setIbcMode,
    toggleIbcMode,
    selectedToken,
    setSelectedToken,
    selectableChains,
    selectedSource,
    setSelectedSource,
    supportedTokens,
    setSupportedTokens
  }

  const message =
    ibcMode === 'deposit'
      ? `Deposit your SCRT via IBC transfer from ${selectedSource.chain_name} to Secret Network`
      : `Withdraw your SCRT via IBC transfer from Secret Network to ${selectedSource.chain_name}`

  return (
    <>
      <Helmet>
        <title>{ibcPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={ibcPageTitle} />
        <meta name="application-name" content={ibcPageTitle} />
        <meta name="description" content={ibcPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={ibcPageTitle} />
        <meta property="og:description" content={ibcPageDescription} />
        <meta property="og:image" content={`/img/secret_dashboard_preview.png`} />

        <meta name="twitter:title" content={ibcPageTitle} />
        <meta name="twitter:description" content={ibcPageDescription} />
        <meta property="twitter:image" content={`/img/secret_dashboard_preview.png`} />

        <script type="application/ld+json">{JSON.stringify(ibcJsonLdSchema)}</script>
      </Helmet>
      <IbcContext.Provider value={ibcContextProviderValue}>
        {/* Content */}
        <div className="container w-full max-w-xl mx-auto px-4">
          {/* Title */}
          <Title className="mb-6" title={`IBC Transfer`} tooltip={message} />
          {/* Content */}
          <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
            <IbcForm />
          </div>
        </div>
      </IbcContext.Provider>
    </>
  )
}
