import { useEffect, useState, useRef, useContext } from 'react'
import { Token } from 'utils/config'
import { portfolioPageTitle, portfolioPageDescription, portfolioJsonLdSchema, isMac, allTokens } from 'utils/commons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Helmet } from 'react-helmet-async'
import BalanceItem from './components/BalanceItem'
import Title from 'components/Title'
import AddressQR from './components/AddressQR'
import { SendService } from 'services/send.service'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import BalanceChart from './components/BalanceChart'
import { useTokenPricesStore } from 'store/TokenPrices'
import BigNumber from 'bignumber.js'

export default function Portfolio() {
  //Search Query
  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }

      // Check for ESC key to blur the search input
      if (event.key === 'Escape') {
        event.preventDefault()
        if (document.activeElement === searchInput.current) {
          searchInput.current?.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const { secretNetworkClient, getBalance } = useSecretNetworkClientStore()

  const { balanceMapping } = useSecretNetworkClientStore()
  const { priceMapping, getValuePrice } = useTokenPricesStore()

  const tokens: Token[] = SendService.getSupportedTokens()

  const [displayedAssets, setDisplayedAssets] = useState<any>(undefined)

  useEffect(() => {
    if (balanceMapping !== null && priceMapping !== null) {
      const orderedTokens = tokens
        .map((token: Token) => {
          const balance = getBalance(token, true)
          const value = getValuePrice(token, BigNumber(balance))
          return { ...token, value: value }
        })
        .sort((a, b) => {
          // Handle NaN, null, or undefined values by treating them as the lowest possible value
          if (a.value == null || isNaN(a.value)) return 1
          if (b.value == null || isNaN(b.value)) return -2

          // Standard comparison for non-NaN and non-null values
          return b.value - a.value
        })
      setDisplayedAssets(
        orderedTokens.filter(
          (token: Token) =>
            token.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            ('s' + token.name)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            token.description?.toLowerCase().includes(searchQuery?.toLowerCase())
        )
      )
    } else {
      setDisplayedAssets(
        tokens.filter(
          (token: Token) =>
            token.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            ('s' + token.name)?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            token.description?.toLowerCase().includes(searchQuery?.toLowerCase())
        )
      )
    }
  }, [searchQuery, balanceMapping, priceMapping])

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
      <div className="max-w-6xl mx-auto mt-8 px-4">
        {secretNetworkClient && (
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 lg:col-span-7 md:col-span-7">
              <AddressQR />
            </div>

            <div className="col-span-12 lg:col-span-5 md:col-span-5">
              <div className="flex flex-col h-full justify-center mx-auto rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 px-2 py-2">
                <BalanceChart />
              </div>
            </div>
          </div>
        )}
        <div />
        {/* All Balances */}
        <div className="mb-4 font-bold text-lg">Your Assets</div>
        <div className="flex flex-col gap-4 sm:flex-row items-center mb-4">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="w-full xs:w-auto">
              <div className="relative sm:w-72">
                <div className="absolute right-0 pr-3 inset-y-0 pointer-events-none text-sm flex items-center">
                  <div className="bg-gray-100 dark:bg-neutral-700 px-1 rounded flex items-center gap-0.5">
                    <kbd>{isMac ? '⌘' : 'CTRL+'}</kbd>
                    <kbd>K</kbd>
                  </div>
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
                </div>
                <input
                  ref={searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  id="search"
                  className="block w-full p-2.5 pl-10 text-sm rounded-lg text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 placeholder-neutral-600 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                  placeholder="Search"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="balance-item flex flex-col">
          {displayedAssets
            ? displayedAssets?.map((token: Token, i: number) => <BalanceItem token={token} key={i} />)
            : tokens?.map((token: Token, i: number) => <BalanceItem token={token} key={i} />)}
        </div>
      </div>
    </>
  )
}
