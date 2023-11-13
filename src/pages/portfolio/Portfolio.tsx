import { useEffect, useState, useContext } from 'react'
import { Token } from 'utils/config'
import { portfolioPageTitle, portfolioPageDescription, portfolioJsonLdSchema, allTokens } from 'utils/commons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Helmet } from 'react-helmet-async'
import BalanceItem from './components/BalanceItem'
import Title from 'components/Title'
import AddressQR from './components/AddressQR'
import { SendService } from 'services/send.service'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'

function Portfolio() {
  //Search Query
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { secretNetworkClient } = useSecretNetworkClientStore()

  const tokens = SendService.getSupportedTokens()

  const displayedAssets = tokens.filter(
    (token: Token) =>
      token.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      ('s' + token.name)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      token.description?.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  return (
    <>
      <Helmet>
        <title>{portfolioPageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={portfolioPageTitle} />
        <meta name="application-name" content={portfolioPageTitle} />
        <meta name="description" content={portfolioPageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={portfolioPageTitle} />
        <meta property="og:description" content={portfolioPageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={portfolioPageTitle} />
        <meta name="twitter:description" content={portfolioPageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">{JSON.stringify(portfolioJsonLdSchema)}</script>
      </Helmet>

      <Title title={'Portfolio'} />
      {/* All Balances */}
      <div className="max-w-6xl mx-auto mt-8">
        {secretNetworkClient && (
          <div className="w-full justify-left mb-12">
            <AddressQR />
          </div>
        )}
        <div />
        {/* All Balances */}
        <div className="mb-4 font-bold text-lg">Your Assets</div>
        <div className="flex flex-col gap-4 sm:flex-row items-center mb-4">
          {/* Search */}
          <div className="flex-1 w-full xs:w-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                id="search"
                className="block w-full sm:w-72 p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                placeholder="Search Asset"
              />
            </div>
          </div>
        </div>

        <div className="balance-item flex flex-col">
          {tokens
            ? displayedAssets.map((token: Token, i: number) => <BalanceItem token={token} key={i} />)
            : [...Array(10)].map((_, index) => <BalanceItem key={index} />)}
        </div>
      </div>
    </>
  )
}

export default Portfolio
