import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Chain, Deposit, Token, chains, tokens } from 'utils/config'
import { IbcMode } from 'types/IbcMode'
import { useSearchParams } from 'react-router-dom'
import { ibcJsonLdSchema, ibcPageDescription, ibcPageTitle } from 'utils/commons'
import Title from 'components/Title'
import IbcForm from './components/IbcForm'
import { IbcService } from 'services/ibc.service'

export function Ibc() {
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.filter((token: Token) => token.name === 'SCRT')[0])

  const [ibcMode, setIbcMode] = useState<IbcMode>('deposit')

  const [selectedSource, setSelectedSource] = useState(
    selectedToken.deposits.find((deposit: Deposit) => deposit.chain_name.toLowerCase() === 'osmosis')
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const modeUrlParam = searchParams.get('mode')
  const chainUrlParam = searchParams.get('chain')
  const tokenUrlParam = searchParams.get('token')

  const selectableChains = IbcService.getSupportedChains()

  function isValidChainUrlParam(): boolean {
    return !!Object.values(chains).find(
      (chain: Chain) => chain.chain_name.toLowerCase() === chainUrlParam.toLowerCase()
    )
  }

  function isValidTokenUrlParam(chain: Chain): boolean {
    return !!IbcService.getSupportedIbcTokensByChain(chain).find(
      (token: Token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
    )
  }

  useEffect(() => {
    if (modeUrlParam?.toLowerCase() === 'deposit') {
      setIbcMode('deposit')
    }
    if (modeUrlParam?.toLowerCase() === 'withdrawal') {
      setIbcMode('withdrawal')
    }
    if (chainUrlParam && isValidChainUrlParam()) {
      const selectedChain = selectableChains.find(
        (chain: Chain) => chain.chain_name.toLowerCase() === chainUrlParam.toLowerCase()
      )

      if (tokenUrlParam && isValidTokenUrlParam(selectedChain)) {
        setSelectedToken(
          IbcService.getSupportedIbcTokensByChain(selectedChain).find(
            (token: Token) => token.name.toLowerCase() === tokenUrlParam.toLowerCase()
          )
        )
      }
    } else {
      if (tokenUrlParam) {
        const chain_name = IbcService.getSupportedChainByIbcTokenName(tokenUrlParam)
        if (chain_name) {
          const params = {
            chain: chain_name,
            mode: 'withdrawal',
            token: tokenUrlParam
          }
          setSearchParams(params)
        }
      }
    }
  }, [chainUrlParam, tokenUrlParam, modeUrlParam])

  const message =
    ibcMode === 'deposit'
      ? `Deposit your ${selectedToken.name} via IBC transfer from ${selectedSource.chain_name} to Secret Network`
      : `Withdraw your ${selectedToken.name} via IBC transfer from Secret Network to ${selectedSource.chain_name}`

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
      {/* Content */}
      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Title */}
        <Title className="mb-6" title="IBC Transfer" tooltip={message} />
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
          <IbcForm />
        </div>
      </div>
    </>
  )
}
